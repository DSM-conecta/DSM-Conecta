const express = require('express');
const router = express.Router();
const painelController = require('../controllers/painelController');

router.post('/', painelController.criar);
router.get('/', painelController.listar);
router.get('/:id', painelController.buscarPorId);
router.put('/:id', painelController.atualizar);
router.delete('/:id', painelController.remover);

module.exports = router;