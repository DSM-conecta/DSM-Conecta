const mqtt = require('mqtt'); // npm install mqtt
const { salvarTelemetria } = require('../services/telemetriaService');
const { salvarFGC } = require('../services/fgcService');
const { salvarFG } = require('../services/fgService');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

const TOPICO_TELEMETRIA = process.env.MQTT_TOPICO_TELEMETRIA || 'telemetria/dados';
const TOPICO_FGC = process.env.MQTT_TOPICO_FGC || 'fgc/dados';
const TOPICO_FG = process.env.MQTT_TOPICO_FG || 'fg/dados';

// Mapeia cada tópico para a função que sabe salvar aquele tipo de dado
const HANDLERS_POR_TOPICO = {
  [TOPICO_TELEMETRIA]: salvarTelemetria,
  [TOPICO_FGC]: salvarFGC,
  [TOPICO_FG]: salvarFG,
};

function iniciarMqtt() {
  const client = mqtt.connect(BROKER_URL, {
    // username: process.env.MQTT_USER,
    // password: process.env.MQTT_PASS,
  });

  client.on('connect', () => {
    console.log(`[MQTT] Conectado ao broker: ${BROKER_URL}`);

    const topicos = Object.keys(HANDLERS_POR_TOPICO);

    client.subscribe(topicos, (erro) => {
      if (erro) {
        console.error('[MQTT] Erro ao se inscrever nos tópicos:', erro.message);
      } else {
        console.log(`[MQTT] Inscrito nos tópicos: ${topicos.join(', ')}`);
      }
    });
  });

  client.on('message', async (topico, mensagem) => {
    const handler = HANDLERS_POR_TOPICO[topico];

    if (!handler) {
      console.warn(`[MQTT] Mensagem recebida em tópico não tratado: ${topico}`);
      return;
    }

    try {
      const payload = JSON.parse(mensagem.toString());
      const registro = await handler(payload);

      console.log(`[MQTT] Registro salvo (id: ${registro._id}) via tópico "${topico}"`);
    } catch (erro) {
      console.error(`[MQTT] Erro ao processar mensagem de "${topico}":`, erro.message);
    }
  });

  client.on('error', (erro) => {
    console.error('[MQTT] Erro de conexão:', erro.message);
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Tentando reconectar ao broker...');
  });

  return client;
}

module.exports = { iniciarMqtt };