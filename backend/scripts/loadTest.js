require('dotenv').config();
const mongoose = require('mongoose');
const Telemetria = require('../src/models/telemetria');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dsm_conecta';

async function executarTesteDeCarga() {
  try {
    console.log('[LoadTest] Conectando ao MongoDB para o teste de escala...');
    await mongoose.connect(MONGO_URI);
    console.log('[LoadTest] Conectado com sucesso!');

    const quantidadeTotal = 1000; 
    const tamanhoDoLote = 100;  
    const lotes = [];

    console.log(`[LoadTest] Gerando ${quantidadeTotal} registos fictícios de telemetria...`);

    for (let i = 1; i <= quantidadeTotal; i++) {
      lotes.push({
        topic: `dsm/stress/teste_${i}`,
        plataforma: i % 2 === 0 ? 'Web' : 'Mobile',
        setor: `Setor_${(i % 5) + 1}`,
        data: new Date(),
        hora: new Date().toTimeString().split(' ')[0],
      });
    }

    console.log('[LoadTest] Iniciando a inserção em lotes (Bulk Insert)...');
    console.time('TempoDeInsercao');

    for (let i = 0; i < lotes.length; i += tamanhoDoLote) {
      const loteAtual = lotes.slice(i, i + tamanhoDoLote);
      await Telemetria.insertMany(loteAtual, { ordered: false }).catch((err) => {
        if (err.code !== 11000) console.error('Erro parcial no lote:', err.message);
      });
    }

    console.timeEnd('TempoDeInsercao');

    const totalNoBanco = await Telemetria.countDocuments();
    console.log(`[LoadTest] Teste concluído! Total de registos atuais na coleção: ${totalNoBanco}`);

  } catch (err) {
    console.error('[LoadTest] Erro crítico durante o teste de carga:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[LoadTest] Ligação ao MongoDB encerrada.');
  }
}

executarTesteDeCarga();