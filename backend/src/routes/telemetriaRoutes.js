const express = require('express');
const router = express.Router();
const telemetriaController = require('../controllers/telemetriaController');
const authAdmin = require('../middleware/authAdmin');

router.post('/', telemetriaController.criar);
router.use(authAdmin.autenticar);
router.get('/', telemetriaController.listar);
router.get('/:id', telemetriaController.buscarPorId);
router.put('/:id', telemetriaController.atualizar);
router.delete('/:id', telemetriaController.remover);

module.exports = router;
