const express = require('express');
const router = express.Router();
const fgcController = require('../controllers/fgcController');

router.post('/', fgcController.criar);
router.get('/', fgcController.listar);
router.get('/:id', fgcController.buscarPorId);
router.put('/:id', fgcController.atualizar);
router.delete('/:id', fgcController.remover);

module.exports = router;