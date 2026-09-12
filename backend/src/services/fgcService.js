const FGC = require('../models/fgc');

/**
 * Salva um registro FGC no banco.
 * Reutilizado tanto pelo controller HTTP quanto pelo subscriber MQTT.
 * @param {Object} dados
 * @returns {Promise<Object>} documento salvo
 */
async function salvarFGC(dados) {
  const {
    name, email,
    QGC1, QGC2, QGC3, QGC4, QGC5,
    QGC6, QGC7, QGC8, QGC9, QGC10,
  } = dados;

  const registro = new FGC({
    name, email,
    QGC1, QGC2, QGC3, QGC4, QGC5,
    QGC6, QGC7, QGC8, QGC9, QGC10,
  });

  await registro.save();

  return registro;
}

module.exports = { salvarFGC };