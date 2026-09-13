const express = require('express');
const router = express.Router();
const fgController = require('../controllers/fgController');

router.post('/', fgController.criar);
router.get('/', fgController.listar);
router.get('/:id', fgController.buscarPorId);
router.put('/:id', fgController.atualizar);
router.delete('/:id', fgController.remover);

module.exports = router;