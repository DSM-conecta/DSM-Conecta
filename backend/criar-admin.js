require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Administrador = require('./src/models/adm');

async function criarAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Verifica se já existe para evitar duplicados
    const existente = await Administrador.findOne({ email: 'admin@teste.com' });
    if (existente) {
      console.log('O administrador já existe na base de dados!');
      process.exit();
    }

    const senhaHash = await bcrypt.hash('123456', 10);
    
    await Administrador.create({
      nome: 'Emanuely',
      email: 'admin@teste.com',
      senha: senhaHash
    });

    console.log('Administrador criado com sucesso!');
  } catch (erro) {
    console.error('Erro ao criar administrador:', erro);
  } finally {
    process.exit();
  }
}

criarAdmin();