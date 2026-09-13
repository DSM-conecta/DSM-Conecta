const Painel = require('../models/painel');

/**
 * Cria um novo registro de alteração no painel.
 * @param {Object} dados - { setor, texto, imagemUrl, administrador }
 */
async function criarPainel(dados) {
  const { setor, texto, imagemUrl, administrador } = dados;

  const painel = new Painel({ setor, texto, imagemUrl, administrador });
  await painel.save();

  return painel.populate('administrador', 'nome email');
}

/**
 * Lista os registros de painel, com filtro opcional por setor.
 * Sempre traz o nome/email do administrador que fez a alteração.
 */
async function listarPainel(filtros = {}) {
  const { setor } = filtros;
  const query = {};

  if (setor) query.setor = setor;

  return Painel.find(query)
    .populate('administrador', 'nome email')
    .sort({ createdAt: -1 });
}

/**
 * Busca um registro de painel por ID.
 */
async function buscarPainelPorId(id) {
  const painel = await Painel.findById(id).populate('administrador', 'nome email');

  if (!painel) {
    throw new Error('Registro de painel não encontrado.');
  }

  return painel;
}

/**
 * Atualiza um registro de painel existente.
 */
async function atualizarPainel(id, dados) {
  const painel = await Painel.findByIdAndUpdate(id, dados, {
    new: true,
    runValidators: true,
  }).populate('administrador', 'nome email');

  if (!painel) {
    throw new Error('Registro de painel não encontrado.');
  }

  return painel;
}

/**
 * Remove um registro de painel.
 */
async function removerPainel(id) {
  const painel = await Painel.findByIdAndDelete(id);

  if (!painel) {
    throw new Error('Registro de painel não encontrado.');
  }

  return painel;
}

module.exports = {
  criarPainel,
  listarPainel,
  buscarPainelPorId,
  atualizarPainel,
  removerPainel,
};