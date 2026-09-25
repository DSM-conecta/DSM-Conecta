const mqtt = require("mqtt");
const mongoose = require("mongoose");
const { salvarTelemetria } = require("../services/telemetriaService");

const MQTT_BROKER = process.env.MQTT_BROKER || "localhost";
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const BROKER_URL = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;

function iniciarSubscriberTelemetria() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: `backend_subscriber_${Math.random().toString(16).substring(2, 8)}`,
    username: process.env.MQTT_USER || "dsm-mosquitto",
    password: process.env.MQTT_PASSWORD || "12345",
    clean: true,
    reconnectPeriod: 2000,
  });

  client.on("connect", () => {
    console.log("[MQTT Subscriber] Conectado ao broker com sucesso!");

    client.subscribe("dsm/#", { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT Subscriber] Erro ao assinar tópicos:", err);
      } else {
        console.log(
          "[MQTT Subscriber] Inscrito na árvore de tópicos: dsm/#",
        );
      }
    });
  });

  client.on("message", async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      await salvarTelemetria({ ...payload, topic });
      console.log(`[MQTT Subscriber] Mensagem processada do tópico: ${topic}`);
    } catch (err) {
      console.error(
        `[MQTT Subscriber] Erro ao processar mensagem do tópico ${topic}:`,
        err.message,
      );
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT Subscriber] Erro na conexão:", err.message);
  });
}

if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dsm_conecta';

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('[MongoDB] Conectado para gravação de telemetria!');
      iniciarSubscriberTelemetria();
    })
    .catch((err) => console.error('[MongoDB] Erro ao conectar:', err.message));
}

module.exports = { iniciarSubscriberTelemetria };