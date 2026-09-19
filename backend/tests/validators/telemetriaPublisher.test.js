require('dotenv').config();
const { enviarMensagemBroker } = require('../../src/mqtt/telemetriaPublisher');

async function dispararTeste() {
  const topico = 'dsm/prod/app/interacao/matriz';
  
  const payloadEvento = {
    plataforma: 'Mobile',
    setor: 'Matriz Curricular',
    data: new Date(),
    hora: new Date().toLocaleTimeString('pt-BR')
  };

  console.log('>>> Disparando mensagem de teste para o Mosquitto...');
  await enviarMensagemBroker(topico, payloadEvento);
  console.log('>>> Mensagem publicada no broker com sucesso!');
  
  setTimeout(() => process.exit(0), 1000);
}

dispararTeste();