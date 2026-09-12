const FGC = require('../models/fgc');
const { salvarFGC } = require('../services/fgcService');

// Criar novo registro FGC (via HTTP)
exports.criar = async (req, res) => {
  try {
    const registro = await salvarFGC(req.body);
    return res.status(201).json(registro);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Listar todos os registros
exports.listar = async (req, res) => {
  try {
    const { email } = req.query;
    const filtro = {};

    if (email) filtro.email = email;

    const registros = await FGC.find(filtro);
    return res.status(200).json(registros);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Buscar registro por ID
exports.buscarPorId = async (req, res) => {
  try {
    const registro = await FGC.findById(req.params.id);

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro FGC não encontrado.' });
    }

    return res.status(200).json(registro);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Atualizar registro
exports.atualizar = async (req, res) => {
  try {
    const registro = await FGC.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro FGC não encontrado.' });
    }

    return res.status(200).json(registro);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Remover registro
exports.remover = async (req, res) => {
  try {
    const registro = await FGC.findByIdAndDelete(req.params.id);

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro FGC não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Registro FGC removido com sucesso.' });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};