const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const BROKER_URL = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;

const client = mqtt.connect(BROKER_URL);

/**
 * Publica uma mensagem de telemetria no broker MQTT.
 * @param {string} topic Ex: 'dsm/prod/app/interacao/tela'
 * @param {Object} dados Objeto com as informações do evento
 */
function enviarMensagemBroker(topic, dados) {
  return new Promise((resolve, reject) => {
    const mensagem = JSON.stringify({
      plataforma: dados.plataforma || 'Web',
      setor: dados.setor || 'Geral',
      data: dados.data || new Date().toISOString(),
      hora: dados.hora || new Date().toLocaleTimeString('pt-BR'),
      ...dados
    });

    client.publish(topic, mensagem, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT] Falha ao publicar no tópico ${topic}:`, err);
        return reject(err);
      }
      console.log(`[MQTT] Mensagem enviada para ${topic}`);
      resolve();
    });
  });
}

module.exports = { enviarMensagemBroker };