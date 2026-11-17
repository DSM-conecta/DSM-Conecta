require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const qrcode = require('qrcode-terminal');
const os = require('os');
const { createApp } = require('./src/app');
const { iniciarSubscriberTelemetria } = require('./src/mqtt/telemetriaSubscriber');

connectDB();

const app = createApp();

function iniciarMqtt() {
    const subscriber = iniciarSubscriberTelemetria();
    return subscriber;
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);

    iniciarMqtt();

    const ip = obterIpLocal();
    const urlAcesso = `http://${ip}:${PORT}/index.html`;

    console.log(`\nAcesse no celular através de: ${urlAcesso}\n`);
    qrcode.generate(urlAcesso, { small: true }, (qrcodeStr) => {
        console.log(qrcodeStr);
    });
});

module.exports = { iniciarMqtt, app };