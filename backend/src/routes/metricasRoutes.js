const express = require('express');
const router = express.Router();
const metricasController = require('../controllers/metricasController');
const authAdmin = require('../middleware/authAdmin');

// Métricas são dados internos: só para administradores.
router.use(authAdmin.autenticar);
router.get('/resumo', metricasController.resumo);
router.get('/acessos', metricasController.acessos);

module.exports = router;
