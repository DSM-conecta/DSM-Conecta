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
    QG1, QG2, QG3, QG4, QG5,
    QG6, QG7, QG8, QG9, QG10,
  } = dados;

  const registro = new FG({
    name, email,
    QG1, QG2, QG3, QG4, QG5,
    QG6, QG7, QG8, QG9, QG10,
  });

  await registro.save();

  return registro;
}

module.exports = { salvarFG };