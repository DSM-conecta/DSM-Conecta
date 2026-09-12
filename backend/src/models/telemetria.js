const mongoose = required ('mongoose');

const telemetriaSchema = new mongoose.Schema({
    plataforma: {
        type: String,
        required:[true, "Qual a plataforma?"]
    },
    setor: {
        type: String,
        required:[true, "Qual o setor?"]
    },
    data: {
        type: Date,
        required:[true, "Qual a plataforma?"]
    },
    hora: {
        type: String,
        required:[true, "Qual a plataforma?"]
    }
})

module.exports = mongoose.models('Telemetria', telemetriaSchema)