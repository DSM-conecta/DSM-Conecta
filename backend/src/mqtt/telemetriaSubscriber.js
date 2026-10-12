require('dotenv').config();
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

      if (!payload.plataforma || !payload.setor || !payload.data || !payload.hora) {
        console.warn(`[MQTT Subscriber] Payload inválido ignorado no tópico ${topic}: Faltam campos obrigatórios.`);
        return;
      }

      const dadosTelemetria = { ...payload, topic };
      
      try {
        await salvarTelemetria(dadosTelemetria);
        console.log(`[MQTT Subscriber] Mensagem processada e salva com sucesso do tópico: ${topic}`);
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          console.warn(`[MQTT Subscriber] Evento duplicado ignorado (já existe no banco): tópico ${topic}`);
        } else {
          throw dbErr;
        }
      }
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