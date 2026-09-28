const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/admController');
const authAdmin = require('../middleware/authAdmin');

router.post('/login', administradorController.login);

// Todas as rotas de gerenciamento exigem uma sessão administrativa.
router.use(authAdmin.autenticar);
router.post('/', administradorController.criar);
router.get('/', administradorController.listar);
router.get('/:id', administradorController.buscarPorId);
router.put('/:id', administradorController.atualizar);
router.delete('/:id', administradorController.remover);

module.exports = router;
