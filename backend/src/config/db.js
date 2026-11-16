const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Administrador = require('../models/adm');

async function garantirAdministradorPrincipal() {
  const email = (process.env.ADMIN_EMAIL || 'admin@admin.com').trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD || 'admin@1234';
  const senhaHash = await bcrypt.hash(senha, 10);

  await Administrador.findOneAndUpdate(
    { email },
    { $set: { nome: 'Administrador', email, senha: senhaHash } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.log(`Conta administrativa principal pronta: ${email}`);
}

// MONGODB_URI é o nome oficial (README, .env.example, createAdmin).
// MONGO_URI continua aceito por compatibilidade com .env antigos.
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dsmconecta';
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await garantirAdministradorPrincipal();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
