require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { iniciarSubscriberTelemetria } = require('../mqtt/telemetriaSubscriber');
const telemetriaRoutes = require('../routes/telemetriaRoutes');

const app = express();
app.use(express.json());

// Rotas HTTP
app.use('/api/telemetria', telemetriaRoutes);

// Conexão com MongoDB e inicialização dos serviços
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsmconecta';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Conectado com sucesso!');
    
    // Inicia o serviço MQTT após confirmar a conexão com o banco
    iniciarSubscriberTelemetria();

    app.listen(PORT, () => {
      console.log(`[HTTP] Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Erro ao conectar:', err.message);
  });