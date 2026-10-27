const Telemetria = require('../models/telemetria');
const eventBus = require('../realtime/eventBus');

/**
 * Salva um registro de telemetria. Usado tanto pelo endpoint HTTP quanto pelo
 * subscriber MQTT. Depois de salvar, avisa o painel em tempo real.
 */
async function salvarTelemetria(dados) {
    const {
        plataforma = 'Web',
        setor = 'Geral',
        // Visitas enviadas por HTTP não têm tópico MQTT; usamos um tópico lógico
        // para que o registro continue válido (o modelo exige o campo).
        topic = `http/${String(plataforma).toLowerCase()}/${setor}`,
        data = new Date(),
        hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        valor,          // <--- Captura o valor numérico
        estatisticas    // <--- Captura o objeto estatístico do motor
    } = dados;

    const telemetria = new Telemetria({
        topic,
        plataforma,
        setor,
        data: new Date(data),
        hora,
        valor,          // <--- Guarda no Mongoose
        estatisticas    // <--- Guarda no Mongoose
    });

    await telemetria.save();

    eventBus.emit('telemetria', {
        _id: telemetria._id,
        topic: telemetria.topic,
        plataforma: telemetria.plataforma,
        setor: telemetria.setor,
        data: telemetria.data,
        hora: telemetria.hora,
        valor: telemetria.valor,
        estatisticas: telemetria.estatisticas
    });

    return telemetria;
}

module.exports = { salvarTelemetria };