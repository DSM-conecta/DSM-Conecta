const mongoose = require('mongoose');

const formularioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  assunto: { type: String, required: true, trim: true, maxlength: 80 },
  mensagem: { type: String, required: true, trim: true, maxlength: 1500 },
}, { timestamps: true });

module.exports = mongoose.model('Formulario', formularioSchema);
