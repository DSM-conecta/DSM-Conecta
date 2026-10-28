const { createApp } = require('../../src/app');
const { gerarToken } = require('../../src/middleware/authAdmin');

jest.mock('mqtt', () => {
    const { EventEmitter } = require('events');
    return {
        connect: jest.fn(() => {
            const cliente = new EventEmitter();
            cliente.subscribe = jest.fn((topico, opcoes, cb) => { if (cb) cb(null); });
            cliente.publish = jest.fn((topico, mensagem, options, cb) => { if (cb) cb(null); });
            cliente.end = jest.fn();
            return cliente;
        }),
    };
}, { virtual: true });

const ID_FALSO = '665f1c2e8b3a4d0012ab34cd';

// Sobe o app em uma porta livre e devolve utilitários para os testes.
async function iniciarServidor() {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = gerarToken(ID_FALSO);

  return {
    base,
    token,
    authHeaders: { Authorization: `Bearer ${token}` },
    fechar: () => new Promise((resolve) => {
      server.closeAllConnections?.();
      server.close(resolve);
    }),
  };
}

// Lê o fluxo SSE até aparecer `trecho` (ou estourar o tempo).
async function lerAte(reader, trecho, acumulado = { texto: '' }, limiteMs = 3000) {
  const decoder = new TextDecoder();
  const limite = Date.now() + limiteMs;

  while (!acumulado.texto.includes(trecho)) {
    if (Date.now() > limite) throw new Error(`Tempo esgotado esperando "${trecho}". Recebido:\n${acumulado.texto}`);
    const { value, done } = await Promise.race([
      reader.read(),
      new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 200)),
    ]).then((r) => (r.timeout ? { value: undefined, done: false } : r));
    if (done) break;
    if (value) acumulado.texto += decoder.decode(value, { stream: true });
  }
  return acumulado;
}

module.exports = { iniciarServidor, lerAte, ID_FALSO };
