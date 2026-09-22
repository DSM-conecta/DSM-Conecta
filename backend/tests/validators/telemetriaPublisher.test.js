const { enviarMensagemBroker } = require('../../src/mqtt/telemetriaPublisher');
const mqtt = require('mqtt');

// Mock do módulo MQTT para evitar que o Jest abra conexões de rede reais durante o teste
jest.mock('mqtt', () => {
  const mockClient = {
    publish: jest.fn((topic, mensagem, options, callback) => callback(null)),
    end: jest.fn()
  };
  return {
    connect: jest.fn(() => mockClient)
  };
});

describe('Validação do Publisher de Telemetria MQTT', () => {

  test('deve enviar mensagem para o broker com sucesso', async () => {
    const dados = {
      plataforma: 'Web',
      setor: 'Geral',
      evento: 'teste_ci'
    };

    // Executa a função passando o tópico e os dados
    await expect(enviarMensagemBroker('dsm/prod/app/interacao/tela', dados)).resolves.not.toThrow();
  });

  test('deve rejeitar e tratar erro quando o publish falha', async () => {
    const mqttMock = mqtt.connect();
    // Simula um erro na chamada do publish
    mqttMock.publish.mockImplementationOnce((topic, mensagem, options, callback) => {
      callback(new Error('Erro de conexão simulado'));
    });

    const dados = { evento: 'teste_falha' };

    await expect(enviarMensagemBroker('dsm/prod/app/interacao/tela', dados)).rejects.toThrow('Erro de conexão simulado');
  });

});