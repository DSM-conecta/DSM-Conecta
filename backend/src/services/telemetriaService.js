const Telemetria = require('../models/telemetria');

async function salvarTelemetria(dados) {
  const {
    topic,
    plataforma = 'Web',
    setor = 'Geral',
    data = new Date(),
    hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } = dados;

  const telemetria = new Telemetria({
    topic,
    plataforma,
    setor,
    data: new Date(data),
    hora
  });

  await telemetria.save();
  return telemetria;
}

module.exports = { salvarTelemetria };