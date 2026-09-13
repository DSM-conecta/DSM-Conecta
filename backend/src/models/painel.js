const mongoose = require('mongoose');

const painelSchema = new mongoose.Schema(
  {
    setor: {
      type: String,
      required: [true, 'O setor é obrigatório'],
    },
    texto: {
      type: String,
      required: [true, 'O texto alterado é obrigatório'],
    },
    imagemUrl: {
      type: String, // URL da imagem hospedada no Cloudinary
      required: [true, 'A URL da imagem é obrigatória'],
    },
    administrador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Administrador',
      required: [true, 'O administrador responsável pela alteração é obrigatório'],
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model('Painel', painelSchema);