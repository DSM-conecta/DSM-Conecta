const express = require('express');
const router = express.Router();
const fgcController = require('../controllers/fgcController');
const authAdmin = require('../middleware/authAdmin');

// Qualquer visitante pode responder ao formulário; ler/alterar respostas
// (que têm nome e e-mail) exige sessão administrativa.
router.post('/', fgcController.criar);
router.use(authAdmin.autenticar);
router.get('/', fgcController.listar);
router.get('/:id', fgcController.buscarPorId);
router.put('/:id', fgcController.atualizar);
router.delete('/:id', fgcController.remover);

module.exports = router;