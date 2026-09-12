const mongoose = require('mongoose');

const admSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
  }
});

module.exports = mongoose.model('Administrador', admSchema);