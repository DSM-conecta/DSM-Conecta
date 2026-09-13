const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/admController');

router.post('/', administradorController.criar);
router.get('/', administradorController.listar);
router.get('/:id', administradorController.buscarPorId);
router.put('/:id', administradorController.atualizar);
router.delete('/:id', administradorController.remover);

router.post('/login', administradorController.login);

module.exports = router;