const path = require('path');
const express = require('express');

const administradorRoutes = require('./routes/admRoutes');
const telemetriaRoutes = require('./routes/telemetriaRoutes');
const fgcRoutes = require('./routes/fgcRoutes');
const fgRoutes = require('./routes/fgRoutes');
const painelRoutes = require('./routes/painelRoutes');
const formularioRoutes = require('./routes/formularioRoutes');
const metricasRoutes = require('./routes/metricasRoutes');
const tempoRealRoutes = require('./routes/tempoRealRoutes');
const docsRoutes = require('./routes/docsRoutes');
const saudeRoutes = require('./routes/saudeRoutes');

/**
 * Monta o aplicativo Express (rotas, documentação, front-end estático).
 * Não conecta ao banco nem ao MQTT e não abre porta — isso é feito em index.js,
 * o que permite testar a API sem servidor real.
 */
function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.use(express.static(path.join(__dirname, '../../frontend')));

  const api = express.Router();
  api.use('/administradores', administradorRoutes);
  api.use('/telemetria', telemetriaRoutes);
  api.use('/fgc', fgcRoutes);
  api.use('/fg', fgRoutes);
  api.use('/painel', painelRoutes);
  api.use('/formularios', formularioRoutes);
  api.use('/metricas', metricasRoutes);
  api.use('/tempo-real', tempoRealRoutes);
  api.use(saudeRoutes);
  api.use(docsRoutes);

  // Endereço oficial: /api/... (é o que a documentação mostra).
  // O endereço sem prefixo continua valendo porque o front-end atual o usa.
  app.use('/api', api);
  app.use('/', api);

  // Rota inexistente dentro da API → JSON (e não a página HTML padrão).
  app.use('/api', (req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));

  // Erros não tratados (ex.: JSON malformado no corpo) → JSON.
  // eslint-disable-next-line no-unused-vars
  app.use((erro, req, res, next) => {
    const status = erro.status || erro.statusCode || 500;
    const mensagem = status === 400 ? 'Corpo da requisição inválido.' : 'Erro interno do servidor.';
    if (status >= 500) console.error('[HTTP] Erro não tratado:', erro);
    res.status(status).json({ mensagem });
  });

  return app;
}

module.exports = { createApp };
