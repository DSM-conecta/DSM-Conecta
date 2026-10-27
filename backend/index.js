require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const qrcode = require('qrcode-terminal'); // npm install qrcode-terminal
const os = require('os');
const path = require('path');
const express = require('express');

const { iniciarSubscriberTelemetria } = require('./src/mqtt/telemetriaSubscriber');
// eslint-disable-next-line no-unused-vars
const { salvarFGC } = require('./src/services/fgcService');
// eslint-disable-next-line no-unused-vars
const { salvarFG } = require('./src/services/fgService');
const mqtt = require('mqtt');
// eslint-disable-next-line no-unused-vars
const { BROKER_URL, TOPICO_FGC, TOPICO_FG, opcoesConexao } = require('./src/config/mqtt');

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

function iniciarMqtt() {
    iniciarSubscriberTelemetria();

    const client = mqtt.connect(BROKER_URL, opcoesConexao());

    client.on('connect', () => {
        console.log(`[MQTT Geral] Conectado ao broker para FGC/FG: ${BROKER_URL}`);

        const topicosParaAssinar = ['fgc/dados', 'fg/dados'];

        client.subscribe(topicosParaAssinar, { qos: 1 }, (erro) => {
            if (erro) {
                console.error('[MQTT Geral] Erro ao se inscrever nos tópicos:', erro.message);
            } else {
                console.log(`[MQTT Geral] Inscrito nos tópicos: ${topicosParaAssinar.join(', ')}`);
            }
        });
    });

    return client;
}

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