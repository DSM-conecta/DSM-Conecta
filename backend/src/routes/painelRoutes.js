const express = require('express');
const router = express.Router();
const painelController = require('../controllers/painelController');
const authAdmin = require('../middleware/authAdmin');

// A página pública da grade só recebe o texto publicado, sem dados de auditoria.
router.get('/grade-atual', painelController.gradeAtual);

router.use(authAdmin.autenticar);
router.post('/', painelController.criar);
router.get('/', painelController.listar);
router.get('/:id', painelController.buscarPorId);
router.put('/:id', painelController.atualizar);
router.delete('/:id', painelController.remover);

module.exports = router;
