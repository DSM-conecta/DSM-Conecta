require('dotenv').config({ quiet: true });
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const { salvarTelemetria } = require("../services/telemetriaService");
const { BROKER_URL, TOPICO_TELEMETRIA, opcoesConexao } = require("../config/mqtt");
const { atualizarMqtt, obterEstadoMqtt } = require("../realtime/estado");

/**
 * Conecta ao broker, assina a árvore de tópicos e grava cada mensagem válida
 * no MongoDB. Cada registro salvo também é publicado no barramento interno
 * (veja telemetriaService), o que alimenta o painel em tempo real.
 *
 * @returns {import('mqtt').MqttClient} cliente MQTT (use .end() para encerrar)
 */
function iniciarSubscriberTelemetria() {
  const client = mqtt.connect(BROKER_URL, {
    ...opcoesConexao(),
    clientId: `backend_subscriber_${Math.random().toString(16).substring(2, 8)}`,
    clean: true,
  });

  atualizarMqtt({ habilitado: true, broker: BROKER_URL, topico: TOPICO_TELEMETRIA });

  client.on("connect", () => {
    console.log("[MQTT Subscriber] Conectado ao broker com sucesso!");
    atualizarMqtt({ conectado: true, ultimoErro: null });

    client.subscribe(TOPICO_TELEMETRIA, { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT Subscriber] Erro ao assinar tópicos:", err);
        atualizarMqtt({ ultimoErro: err.message });
      } else {
        console.log(
          `[MQTT Subscriber] Inscrito na árvore de tópicos: ${TOPICO_TELEMETRIA}`,
        );
      }
    });
  });

  client.on("close", () => atualizarMqtt({ conectado: false }));
  client.on("offline", () => atualizarMqtt({ conectado: false }));

  client.on("message", async (topic, message) => {
    atualizarMqtt({
      mensagensRecebidas: obterEstadoMqtt().mensagensRecebidas + 1,
      ultimaMensagemEm: new Date().toISOString(),
    });

    try {
      const payload = JSON.parse(message.toString());

      if (!payload.plataforma || !payload.setor || !payload.data || !payload.hora) {
        console.warn(`[MQTT Subscriber] Payload inválido ignorado no tópico ${topic}: Faltam campos obrigatórios.`);
        return;
      }

      const dadosTelemetria = { ...payload, topic };

      try {
        await salvarTelemetria(dadosTelemetria);
        atualizarMqtt({ mensagensSalvas: obterEstadoMqtt().mensagensSalvas + 1 });
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
    atualizarMqtt({ ultimoErro: err.message });
  });

  return client;
}

if (require.main === module) {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dsmconecta';

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('[MongoDB] Conectado para gravação de telemetria!');
      iniciarSubscriberTelemetria();
    })
    .catch((err) => console.error('[MongoDB] Erro ao conectar:', err.message));
}

module.exports = { iniciarSubscriberTelemetria };
