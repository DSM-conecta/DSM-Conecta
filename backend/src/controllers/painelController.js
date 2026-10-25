const {
  criarPainel,
  listarPainel,
  buscarPainelPorId,
  atualizarPainel,
  removerPainel,
} = require('../services/painelService');
const eventBus = require('../realtime/eventBus');

exports.gradeAtual = async (req, res) => {
  try {
    const registros = await listarPainel({ setor: 'grade-curricular' });
    return res.status(200).json({ texto: registros[0]?.texto || '' });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Criar novo registro de alteração no painel
exports.criar = async (req, res) => {
  try {
    // O autor vem sempre do token da sessão — nunca do corpo da requisição,
    // para que ninguém publique em nome de outro administrador.
    const painel = await criarPainel({ ...req.body, administrador: req.admin.id });
    eventBus.emit('painel', { _id: painel._id, setor: painel.setor, createdAt: painel.createdAt });
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
    // O autor de um registro não pode ser trocado por esta rota.
    const dados = { ...req.body };
    delete dados.administrador;
    const painel = await atualizarPainel(req.params.id, dados);
    eventBus.emit('painel', { _id: painel._id, setor: painel.setor, updatedAt: painel.updatedAt });
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
