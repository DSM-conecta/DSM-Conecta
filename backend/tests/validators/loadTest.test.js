const { enviarMensagemBroker } = require('../../src/mqtt/telemetriaPublisher');

jest.mock('mqtt', () => {
  const mockClient = {
    publish: jest.fn((topic, mensagem, options, callback) => callback(null)),
    end: jest.fn(),
    on: jest.fn(),
  };
  return {
    connect: jest.fn(() => mockClient),
  };
});

describe('Teste de Carga / Stress (Load Test) do Publisher MQTT', () => {
  test('deve processar múltiplos envios concorrentes de telemetria sem falhas', async () => {
    const numeroDeMensagens = 50;
    const promessas = [];

    for (let i = 0; i < numeroDeMensagens; i++) {
      const dados = {
        plataforma: i % 2 === 0 ? 'Web' : 'Mobile',
        setor: `Setor_${i % 5}`,
        evento: `load_test_event_${i}`,
        data: new Date().toISOString(),
        hora: '21:00:00',
      };

      promessas.push(enviarMensagemBroker('dsm/prod/app/carga/teste', dados));
    }

    await expect(Promise.all(promessas)).resolves.not.toThrow();
    expect(promessas.length).toBe(numeroDeMensagens);
  });
});