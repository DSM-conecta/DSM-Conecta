const { enviarMensagemBroker } = require('../mqtt/telemetriaPublisher');
const Telemetria = require('../models/telemetria');

exports.criar = async (req, res) => {
  try {
    const dados = req.body;
    const setor = dados.setor || 'Geral';
    const topico = `dsm/prod/app/interacao/${setor}`;

    await enviarMensagemBroker(topico, dados);

    return res.status(202).json({ mensagem: 'Evento de telemetria enviado para o broker MQTT com sucesso.' });
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const { plataforma, setor } = req.query;
    const filtro = {};

    if (plataforma) filtro.plataforma = plataforma;
    if (setor) filtro.setor = setor;

    const registros = await Telemetria.find(filtro).sort({ data: -1 });
    return res.status(200).json(registros);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Buscar registro por ID
exports.buscarPorId = async (req, res) => {
  try {
    const registro = await Telemetria.findById(req.params.id);

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro de telemetria não encontrado.' });
    }

    return res.status(200).json(registro);
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// Atualizar registro
exports.atualizar = async (req, res) => {
  try {
    const registro = await Telemetria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro de telemetria não encontrado.' });
    }

    return res.status(200).json(registro);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

// Remover registro
exports.remover = async (req, res) => {
  try {
    const registro = await Telemetria.findByIdAndDelete(req.params.id);

    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro de telemetria não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Registro de telemetria removido com sucesso.' });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};