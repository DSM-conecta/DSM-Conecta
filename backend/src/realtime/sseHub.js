const eventBus = require('./eventBus');

// Eventos do barramento que são repassados aos clientes conectados.
const EVENTOS_PUBLICOS = ['telemetria', 'formulario', 'painel'];

const MAX_CLIENTES = 50;
const INTERVALO_HEARTBEAT_MS = 25000;

// cliente = { res, exp } — exp é o fim da sessão do token (segundos desde 1970)
const clientes = new Set();
let timer = null;

function escrever(res, texto) {
  try {
    res.write(texto);
    return true;
  } catch {
    return false;
  }
}

function formatar(evento, dados) {
  return `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;
}

function remover(cliente) {
  clientes.delete(cliente);
  if (!clientes.size && timer) {
    clearInterval(timer);
    timer = null;
  }
}

function enviarParaTodos(evento, dados) {
  const mensagem = formatar(evento, dados);
  for (const cliente of clientes) {
    if (!escrever(cliente.res, mensagem)) remover(cliente);
  }
}

function batimento() {
  const agora = Math.floor(Date.now() / 1000);
  for (const cliente of [...clientes]) {
    // O token administrativo expira; a conexão não deve sobreviver a ele.
    if (cliente.exp && cliente.exp <= agora) {
      escrever(cliente.res, formatar('sessao-expirada', { mensagem: 'Sessão administrativa expirada.' }));
      cliente.res.end();
      remover(cliente);
      continue;
    }
    // Linha de comentário SSE: mantém proxies e navegadores com a conexão aberta.
    if (!escrever(cliente.res, `: ping ${Date.now()}\n\n`)) remover(cliente);
  }
}

/**
 * Registra uma resposta HTTP como cliente do fluxo de eventos.
 * Retorna false quando o limite de conexões simultâneas foi atingido.
 */
function adicionarCliente(req, res, { exp, aoConectar } = {}) {
  if (clientes.size >= MAX_CLIENTES) return false;

  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // evita buffering em proxies nginx
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  const cliente = { res, exp };
  clientes.add(cliente);
  if (!timer) {
    timer = setInterval(batimento, INTERVALO_HEARTBEAT_MS);
    timer.unref();
  }

  if (typeof aoConectar === 'function') {
    const [evento, dados] = aoConectar();
    res.write(formatar(evento, dados));
  }

  req.on('close', () => remover(cliente));
  return true;
}

function totalClientes() {
  return clientes.size;
}

// Fecha todas as conexões (usado no desligamento do servidor e nos testes).
function encerrarTodos() {
  for (const cliente of [...clientes]) {
    try { cliente.res.end(); } catch { /* conexão já encerrada */ }
    remover(cliente);
  }
}

EVENTOS_PUBLICOS.forEach((evento) => {
  eventBus.on(evento, (dados) => enviarParaTodos(evento, dados));
});

module.exports = { adicionarCliente, totalClientes, encerrarTodos, enviarParaTodos };
