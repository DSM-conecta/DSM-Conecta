const FG = require('../models/fg');

/**
 * Salva um registro FG no banco.
 * Reutilizado tanto pelo controller HTTP quanto pelo subscriber MQTT.
 * @param {Object} dados
 * @returns {Promise<Object>} documento salvo
 */
async function salvarFG(dados) {
  const {
    name, email,
    QGC1, QGC2, QGC3, QGC4, QGC5,
    QGC6, QGC7, QGC8, QGC9, QGC10,
  } = dados;

  const registro = new FG({
    name, email,
    QGC1, QGC2, QGC3, QGC4, QGC5,
    QGC6, QGC7, QGC8, QGC9, QGC10,
  });

  await registro.save();

  return registro;
}

module.exports = { salvarFG };