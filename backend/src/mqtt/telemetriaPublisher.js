const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const BROKER_URL = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;

const client = mqtt.connect(BROKER_URL, {
  username: process.env.MQTT_USER || 'dsm-mosquitto',
  password: process.env.MQTT_PASSWORD || '12345',
  reconnectPeriod: 2000,
});

if (client && typeof client.on === 'function') {
  client.on('connect', () => {
    console.log('[MQTT Publisher] Conectado ao broker!');
  });

  client.on('error', (err) => {
    console.error('[MQTT Publisher] Erro de conexão:', err.message);
  });
}

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
      console.log(`[MQTT] Payload publicado com sucesso -> Tópico: "${topic}"`);
      resolve();
    });
  });
}

if (require.main === module) {
  setTimeout(async () => {
    try {
      await enviarMensagemBroker('dsm/prod/app/interacao/tela', {
        evento: 'teste_via_script_node'
      });
      setTimeout(() => client.end(), 1000);
    } catch (err) {
      console.error(err);
      client.end();
    }
  }, 500);
}

module.exports = { enviarMensagemBroker };