const mongoose = require('mongoose');

const telemetriaSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
    },
    plataforma: {
        type: String,
        required: [true, 'Qual a plataforma?'],
    },
    setor: {
        type: String,
        required: [true, 'Qual o setor?'],
    },
    data: {
        type: Date,
        required: [true, 'Qual a data?'],
    },
    hora: {
        type: String,
        required: [true, 'Qual a hora?'],
    },
    valor: {
        type: Number,
    },
    estatisticas: {
        mediaMovel: { type: Number },
        desvio: { type: Number },
        ehAnomalia: { type: Boolean }
    }
});

telemetriaSchema.index({ topic: 1, plataforma: 1, setor: 1, data: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Telemetria', telemetriaSchema);