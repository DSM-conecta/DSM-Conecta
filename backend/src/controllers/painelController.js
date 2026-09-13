const {
  criarPainel,
  listarPainel,
  buscarPainelPorId,
  atualizarPainel,
  removerPainel,
} = require('../services/painelService');

// Criar novo registro de alteração no painel
exports.criar = async (req, res) => {
  try {
    const painel = await criarPainel(req.body);
    return res.status(201).json(painel);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Listar registros (com filtro opcional ?setor=)
exports.listar = async (req, res) => {
  try {
    const painel = await listarPainel(req.query);
    return res.status(200).json(painel);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Buscar registro por ID
exports.buscarPorId = async (req, res) => {
  try {
    const painel = await buscarPainelPorId(req.params.id);
    return res.status(200).json(painel);
  } catch (erro) {
    return res.status(404).json({ mensagem: erro.message });
  }
};

// Atualizar registro
exports.atualizar = async (req, res) => {
  try {
    const painel = await atualizarPainel(req.params.id, req.body);
    return res.status(200).json(painel);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Remover registro
exports.remover = async (req, res) => {
  try {
    await removerPainel(req.params.id);
    return res.status(200).json({ mensagem: 'Registro de painel removido com sucesso.' });
  } catch (erro) {
    return res.status(404).json({ mensagem: erro.message });
  }
};