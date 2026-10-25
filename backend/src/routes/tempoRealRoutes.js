const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const sseHub = require('../realtime/sseHub');
const { obterEstadoMqtt } = require('../realtime/estado');

router.use(authAdmin.autenticar);

// Fluxo Server-Sent Events: o servidor empurra eventos (telemetria, formulario,
// painel) assim que acontecem. O cliente deve enviar o header Authorization.
router.get('/eventos', (req, res) => {
  const aceito = sseHub.adicionarCliente(req, res, {
    exp: req.admin.exp,
    aoConectar: () => ['status', { mqtt: obterEstadoMqtt(), clientesConectados: sseHub.totalClientes() }],
  });

  if (!aceito) {
    return res.status(503).json({ mensagem: 'Limite de conexões em tempo real atingido. Tente novamente em instantes.' });
  }
  return undefined;
});

router.get('/status', (req, res) => {
  res.status(200).json({
    sse: { clientesConectados: sseHub.totalClientes() },
    mqtt: obterEstadoMqtt(),
  });
});

module.exports = router;
