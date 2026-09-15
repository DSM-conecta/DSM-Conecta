const express = require('express');
const router = express.Router();
const telemetriaController = require('../controllers/telemetriaController');

router.post('/', telemetriaController.criar);
router.get('/', telemetriaController.listar);
router.get('/:id', telemetriaController.buscarPorId);
router.put('/:id', telemetriaController.atualizar);
router.delete('/:id', telemetriaController.remover);

module.exports = router;