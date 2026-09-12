const bcrypt = require('bcryptjs'); // npm install bcryptjs
const Administrador = require('../models/Administrador');

// Criar novo administrador
exports.criar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existente = await Administrador.findOne({ email });
    if (existente) {
      return res.status(400).json({ mensagem: 'Já existe um administrador com este email.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const administrador = new Administrador({
      nome,
      email,
      senha: senhaCriptografada,
    });

    await administrador.save();

    // Não retornar a senha na resposta
    const { senha: _senha, ...adminSemSenha } = administrador.toObject();

    return res.status(201).json(adminSemSenha);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Listar todos os administradores
exports.listar = async (req, res) => {
  try {
    const administradores = await Administrador.find().select('-senha');
    return res.status(200).json(administradores);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Buscar administrador por ID
exports.buscarPorId = async (req, res) => {
  try {
    const administrador = await Administrador.findById(req.params.id).select('-senha');

    if (!administrador) {
      return res.status(404).json({ mensagem: 'Administrador não encontrado.' });
    }

    return res.status(200).json(administrador);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Atualizar administrador
exports.atualizar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const dadosAtualizados = { nome, email };

    if (senha) {
      dadosAtualizados.senha = await bcrypt.hash(senha, 10);
    }

    const administrador = await Administrador.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true, runValidators: true }
    ).select('-senha');

    if (!administrador) {
      return res.status(404).json({ mensagem: 'Administrador não encontrado.' });
    }

    return res.status(200).json(administrador);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Remover administrador
exports.remover = async (req, res) => {
  try {
    const administrador = await Administrador.findByIdAndDelete(req.params.id);

    if (!administrador) {
      return res.status(404).json({ mensagem: 'Administrador não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Administrador removido com sucesso.' });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Login (bônus: útil já que existe senha/email)
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const administrador = await Administrador.findOne({ email });
    if (!administrador) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, administrador.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    const { senha: _senha, ...adminSemSenha } = administrador.toObject();
    return res.status(200).json(adminSemSenha);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};