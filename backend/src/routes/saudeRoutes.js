const express = require('express');
const mongoose = require('mongoose');
const { obterEstadoMqtt } = require('../realtime/estado');

const router = express.Router();

router.get('/saude', (req, res) => {
  res.status(200).json({
    status: 'ok',
    banco: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    mqtt: obterEstadoMqtt(),
    uptimeSegundos: Math.round(process.uptime()),
  });
});

module.exports = router;
