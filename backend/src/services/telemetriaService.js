const Telemetria = require('../models/telemetria');

/**
 * Salva um registro de telemetria no banco.
 * Reutilizado tanto pelo controller HTTP quanto pelo subscriber MQTT.
 * @param {Object} dados - { plataforma, setor, data, hora }
 * @returns {Promise<Object>} documento salvo
 */
async function salvarTelemetria(dados) {
  const { plataforma, setor, data, hora } = dados;

  const telemetria = new Telemetria({ plataforma, setor, data, hora });
  await telemetria.save();

  return telemetria;
}

module.exports = { salvarTelemetria };