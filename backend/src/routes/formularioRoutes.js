const express = require('express');
const formularioController = require('../controllers/formularioController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.post('/', formularioController.criar);
router.get('/', authAdmin.autenticar, formularioController.listar);

module.exports = router;
