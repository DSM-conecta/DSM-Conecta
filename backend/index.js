const path = require('path');

// Carrega o .env de backend/.env (ou, se não existir, da raiz do projeto).
// Precisa vir antes dos demais require, que leem process.env.
require('dotenv').config({
  path: [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')],
  quiet: true,
});

const connectDB = require('./src/config/db');
const { createApp } = require('./src/app');
const { iniciarSubscriberTelemetria } = require('./src/mqtt/telemetriaSubscriber');
const { atualizarMqtt } = require('./src/realtime/estado');
const sseHub = require('./src/realtime/sseHub');

const PORT = process.env.PORT || 5000;

async function iniciar() {
  await connectDB();

  // Canal em tempo real: assina o broker MQTT e grava/transmite cada mensagem.
  // MQTT_HABILITADO=false permite rodar só a API/site sem um broker.
  let mqttClient = null;
  if (process.env.MQTT_HABILITADO === 'false') {
    atualizarMqtt({ habilitado: false });
    console.log('[MQTT] Desabilitado por MQTT_HABILITADO=false.');
  } else {
    mqttClient = iniciarSubscriberTelemetria();
  }

  const server = createApp().listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação da API: http://localhost:${PORT}/api/docs`);
  });

  const encerrar = () => {
    console.log('Encerrando servidor...');
    sseHub.encerrarTodos();
    if (mqttClient) mqttClient.end();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

iniciar();
