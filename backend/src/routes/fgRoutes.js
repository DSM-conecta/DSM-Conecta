const express = require('express');
const router = express.Router();
const fgController = require('../controllers/fgController');
const authAdmin = require('../middleware/authAdmin');

// Qualquer visitante pode responder ao formulário; ler/alterar respostas
// (que têm nome e e-mail) exige sessão administrativa.
router.post('/', fgController.criar);
router.use(authAdmin.autenticar);
router.get('/', fgController.listar);
router.get('/:id', fgController.buscarPorId);
router.put('/:id', fgController.atualizar);
router.delete('/:id', fgController.remover);

module.exports = router;