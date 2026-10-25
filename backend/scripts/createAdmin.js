require('dotenv').config();
const readline = require('readline/promises');
const { stdin, stdout } = require('process');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Administrador = require('../src/models/adm');

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const nome = (await rl.question('Nome do administrador: ')).trim();
    const email = (await rl.question('E-mail: ')).trim().toLowerCase();
    const senha = await rl.question('Senha: ');

    if (!nome || !email || !senha) throw new Error('Nome, e-mail e senha são obrigatórios.');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsmconecta');
    const existente = await Administrador.findOne({ email });
    if (existente) throw new Error('Já existe um administrador com este e-mail.');

    await Administrador.create({ nome, email, senha: await bcrypt.hash(senha, 10) });
    console.log(`Administrador ${email} criado com sucesso.`);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
