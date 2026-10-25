const metricasService = require('../services/metricasService');
const { obterEstadoMqtt } = require('../realtime/estado');
const { totalClientes } = require('../realtime/sseHub');

exports.resumo = async (req, res) => {
  try {
    const dados = await metricasService.resumo();
    return res.status(200).json({
      ...dados,
      tempoReal: { mqtt: obterEstadoMqtt(), clientesConectados: totalClientes() },
    });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

exports.acessos = async (req, res) => {
  try {
    const { dias, setor, plataforma } = req.query;
    const filtros = {};

    if (dias !== undefined) {
      const quantidade = Number(dias);
      if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 365) {
        return res.status(400).json({ mensagem: 'O parâmetro "dias" deve ser um inteiro entre 1 e 365.' });
      }
      filtros.dias = quantidade;
    }

    // Só aceitamos texto simples; evita que ?setor[$ne]=x vire operador do MongoDB.
    if (typeof setor === 'string' && setor) filtros.setor = setor;
    if (typeof plataforma === 'string' && plataforma) filtros.plataforma = plataforma;

    return res.status(200).json(await metricasService.acessos(filtros));
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};
