const mongoose = require('mongoose');

const telemetriaSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('Telemetria', telemetriaSchema);