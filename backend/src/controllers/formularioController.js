const Formulario = require('../models/formulario');

exports.criar = async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    const resposta = await Formulario.create({ nome, email, assunto, mensagem });
    return res.status(201).json({ mensagem: 'Mensagem recebida.', id: resposta._id });
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const respostas = await Formulario.find().sort({ createdAt: -1 });
    return res.status(200).json(respostas);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};
