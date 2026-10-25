const { EventEmitter } = require('events');
const Telemetria = require('../../src/models/telemetria');
const Formulario = require('../../src/models/formulario');
const { iniciarServidor, lerAte } = require('./helpers');

jest.mock('../../src/models/adm');
jest.mock('../../src/models/telemetria');
jest.mock('../../src/models/formulario');
jest.mock('../../src/models/painel');
jest.mock('../../src/models/fg');
jest.mock('../../src/models/fgc');

// O broker real não existe nos testes: este cliente falso se comporta como o do pacote mqtt.
const mockClientes = [];
jest.mock('mqtt', () => {
  const { EventEmitter: Emitter } = require('events');
  return {
    connect: jest.fn(() => {
      const cliente = new Emitter();
      cliente.subscribe = jest.fn((topico, opcoes, cb) => cb(null));
      cliente.end = jest.fn();
      mockClientes.push(cliente);
      return cliente;
    }),
  };
});

const { iniciarSubscriberTelemetria } = require('../../src/mqtt/telemetriaSubscriber');
const { obterEstadoMqtt } = require('../../src/realtime/estado');
const sseHub = require('../../src/realtime/sseHub');

let servidor;
beforeAll(async () => { servidor = await iniciarServidor(); });
afterAll(async () => {
  sseHub.encerrarTodos();
  await servidor.fechar();
});
beforeEach(() => jest.clearAllMocks());

async function abrirFluxo() {
  const controle = new AbortController();
  const res = await fetch(`${servidor.base}/api/tempo-real/eventos`, { headers: servidor.authHeaders, signal: controle.signal });
  const reader = res.body.getReader();
  const acumulado = { texto: '' };
  return { res, reader, acumulado, fechar: () => controle.abort() };
}

// Faz o Telemetria (mockado) se comportar como um documento que salva com sucesso.
function simularSalvamento() {
  Telemetria.mockImplementation(function (dados) {
    Object.assign(this, { _id: 'abc123', ...dados });
    this.save = jest.fn().mockResolvedValue(this);
  });
}

describe('Canal em tempo real (SSE)', () => {
  test('conecta com token, recebe cabeçalhos SSE e o evento de status inicial', async () => {
    const fluxo = await abrirFluxo();

    expect(fluxo.res.status).toBe(200);
    expect(fluxo.res.headers.get('content-type')).toMatch(/text\/event-stream/);
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);
    expect(fluxo.acumulado.texto).toContain('"mqtt"');

    fluxo.fechar();
  });

  test('uma visita registrada por HTTP chega ao painel na hora', async () => {
    simularSalvamento();
    const fluxo = await abrirFluxo();
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);

    const post = await fetch(`${servidor.base}/api/telemetria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plataforma: 'Web', setor: 'grade' }),
    });
    expect(post.status).toBe(201);

    await lerAte(fluxo.reader, 'event: telemetria', fluxo.acumulado);
    expect(fluxo.acumulado.texto).toContain('"setor":"grade"');
    // visita sem tópico MQTT recebe um tópico lógico (o modelo exige o campo)
    expect(fluxo.acumulado.texto).toContain('"topic":"http/web/grade"');

    fluxo.fechar();
  });

  test('uma mensagem de contato enviada chega ao painel na hora', async () => {
    Formulario.create.mockResolvedValue({
      _id: 'f1', nome: 'Ana', email: 'ana@email.com', assunto: 'Dúvida', mensagem: 'Olá!', createdAt: new Date().toISOString(),
    });
    const fluxo = await abrirFluxo();
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);

    await fetch(`${servidor.base}/api/formularios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Ana', email: 'ana@email.com', assunto: 'Dúvida', mensagem: 'Olá!' }),
    });

    await lerAte(fluxo.reader, 'event: formulario', fluxo.acumulado);
    expect(fluxo.acumulado.texto).toContain('"nome":"Ana"');

    fluxo.fechar();
  });

  test('mensagem MQTT → grava no banco → chega ao painel (cadeia completa, broker simulado)', async () => {
    simularSalvamento();
    const cliente = iniciarSubscriberTelemetria();
    cliente.emit('connect');

    expect(cliente.subscribe).toHaveBeenCalledWith('dsm/#', { qos: 1 }, expect.any(Function));
    expect(obterEstadoMqtt()).toMatchObject({ habilitado: true, conectado: true, topico: 'dsm/#' });

    const fluxo = await abrirFluxo();
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);

    const antes = obterEstadoMqtt();
    cliente.emit('message', 'dsm/prod/app/interacao/tela', Buffer.from(JSON.stringify({
      plataforma: 'Mobile', setor: 'sobre', data: new Date().toISOString(), hora: '21:35',
    })));

    await lerAte(fluxo.reader, 'event: telemetria', fluxo.acumulado);
    expect(fluxo.acumulado.texto).toContain('"topic":"dsm/prod/app/interacao/tela"');
    expect(fluxo.acumulado.texto).toContain('"plataforma":"Mobile"');

    const depois = obterEstadoMqtt();
    expect(depois.mensagensRecebidas).toBe(antes.mensagensRecebidas + 1);
    expect(depois.mensagensSalvas).toBe(antes.mensagensSalvas + 1);
    expect(depois.ultimaMensagemEm).not.toBeNull();

    fluxo.fechar();
  });

  test('payload MQTT incompleto é ignorado: não grava e não transmite', async () => {
    simularSalvamento();
    const cliente = iniciarSubscriberTelemetria();
    const avisos = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const recebidos = [];
    const bus = require('../../src/realtime/eventBus');
    const ouvinte = (d) => recebidos.push(d);
    bus.on('telemetria', ouvinte);

    cliente.emit('message', 'dsm/x', Buffer.from(JSON.stringify({ plataforma: 'Web' })));
    await new Promise((r) => setTimeout(r, 20));

    expect(recebidos).toHaveLength(0);
    expect(Telemetria).not.toHaveBeenCalled();
    bus.off('telemetria', ouvinte);
    avisos.mockRestore();
  });

  test('queda do broker é refletida no estado; reconexão volta a conectado', () => {
    const cliente = iniciarSubscriberTelemetria();
    cliente.emit('connect');
    expect(obterEstadoMqtt().conectado).toBe(true);
    cliente.emit('close');
    expect(obterEstadoMqtt().conectado).toBe(false);
    cliente.emit('connect');
    expect(obterEstadoMqtt().conectado).toBe(true);
  });

  test('GET /api/tempo-real/status informa MQTT e clientes SSE conectados', async () => {
    const fluxo = await abrirFluxo();
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);

    const res = await fetch(`${servidor.base}/api/tempo-real/status`, { headers: servidor.authHeaders });
    const corpo = await res.json();
    expect(res.status).toBe(200);
    expect(corpo.sse.clientesConectados).toBeGreaterThanOrEqual(1);
    expect(corpo.mqtt).toHaveProperty('conectado');

    fluxo.fechar();
  });

  test('o cliente é removido quando fecha a conexão', async () => {
    const fluxo = await abrirFluxo();
    await lerAte(fluxo.reader, 'event: status', fluxo.acumulado);
    const durante = sseHub.totalClientes();
    fluxo.fechar();
    await new Promise((r) => setTimeout(r, 100));
    expect(sseHub.totalClientes()).toBe(durante - 1);
  });

  test('sessão com token vencido recebe aviso e a conexão é encerrada', () => {
    jest.useFakeTimers();
    try {
      const escritos = [];
      const res = {
        status: () => res, set: () => res, flushHeaders: () => {},
        write: (t) => { escritos.push(t); return true; },
        end: jest.fn(),
      };
      const req = new EventEmitter();
      const exp = Math.floor(Date.now() / 1000) + 30; // vence em 30 s

      expect(sseHub.adicionarCliente(req, res, { exp })).toBe(true);
      jest.advanceTimersByTime(25000); // 1º batimento: ainda válido
      expect(res.end).not.toHaveBeenCalled();
      jest.advanceTimersByTime(25000); // 2º batimento: vencido
      expect(escritos.join('')).toContain('event: sessao-expirada');
      expect(res.end).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
      sseHub.encerrarTodos();
    }
  });
});
