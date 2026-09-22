const mqtt = require('mqtt');
const { salvarTelemetria } = require('../services/telemetriaService');

// Carrega as variáveis configuradas no .env (RNF13)
const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const BROKER_URL = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;

function iniciarSubscriberTelemetria() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: `backend_subscriber_${Math.random().toString(16).substring(2, 8)}`,
    clean: true,
    reconnectPeriod: 2000,
  });

  client.on('connect', () => {
    console.log('[MQTT] Conectado ao broker com sucesso!');

    // Assina os tópicos no padrão dsm/ambiente/origem/categoria/identificador (QoS 1)
    client.subscribe('dsm/+/+/+/+', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Erro ao assinar tópicos:', err);
      } else {
        console.log('[MQTT] Inscrito na árvore de tópicos: dsm/+/+/+/+');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      // Repassa para a regra de negócio/banco
      await salvarTelemetria({ ...payload, topic });
      console.log(`[MQTT] Mensagem processada do tópico: ${topic}`);
    } catch (err) {
      console.error(`[MQTT] Erro ao processar mensagem do tópico ${topic}:`, err.message);
    }
  });

  client.on('error', (err) => {
    console.error('[MQTT] Erro na conexão:', err.message);
  });
}

module.exports = { iniciarSubscriberTelemetria };