require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const mqtt = require('mqtt'); // npm install mqtt
const qrcode = require('qrcode-terminal'); // npm install qrcode-terminal
const os = require('os');
const path = require('path');
const express = require('express');

const { salvarTelemetria } = require('./src/services/telemetriaService');
const { salvarFGC } = require('./src/services/fgcService');
const { salvarFG } = require('./src/services/fgService');

const router = express.Router();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

connectDB();

const administradorRoutes = require('./src/routes/admRoutes');
const telemetriaRoutes = require('./src/routes/telemetriaRoutes');
const fgcRoutes = require('./src/routes/fgcRoutes');
const fgRoutes = require('./src/routes/fgRoutes');
const painelRoutes = require('./src/routes/painelRoutes');
const formularioRoutes = require('./src/routes/formularioRoutes');

router.use('/administradores', administradorRoutes);
router.use('/telemetria', telemetriaRoutes);
router.use('/fgc', fgcRoutes);
router.use('/fg', fgRoutes);
router.use('/painel', painelRoutes);
router.use('/formularios', formularioRoutes);

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

const TOPICO_TELEMETRIA = process.env.MQTT_TOPICO_TELEMETRIA || 'dsm/#';
const TOPICO_FGC = process.env.MQTT_TOPICO_FGC || 'fgc/dados';
const TOPICO_FG = process.env.MQTT_TOPICO_FG || 'fg/dados';

// Mapeia cada tópico para a função que sabe salvar aquele tipo de dado
const HANDLERS_POR_TOPICO = {
  [TOPICO_TELEMETRIA]: salvarTelemetria,
  [TOPICO_FGC]: salvarFGC,
  [TOPICO_FG]: salvarFG,
};

function iniciarMqtt() {
  const client = mqtt.connect(BROKER_URL, {});

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
    const handler = topico.startsWith('dsm/') ? salvarTelemetria : HANDLERS_POR_TOPICO[topico];

    if (!handler) {
      console.warn(`[MQTT] Mensagem recebida em tópico não tratado: ${topico}`);
      return;
    }

    try {
      const payload = JSON.parse(mensagem.toString());
      const registro = await handler({ ...payload, topic: topico });

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

// Função auxiliar para encontrar o IP local da máquina na rede Wi-Fi
function obterIpLocal() {
  const interfaces = os.networkInterfaces();
  for (const nome in interfaces) {
    for (const net of interfaces[nome]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.use('/', router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  iniciarMqtt();

  const ip = obterIpLocal();
  const urlAcesso = `http://${ip}:${PORT}/index.html`;

  console.log(`\nAcede no telemóvel através de: ${urlAcesso}\n`);
  qrcode.generate(urlAcesso, { small: true }, (qrcodeStr) => {
    console.log(qrcodeStr);
  });
});

module.exports = { iniciarMqtt, router };
