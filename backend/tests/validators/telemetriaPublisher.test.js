const { enviarMensagemBroker } = require("../../src/mqtt/telemetriaPublisher");
const mqtt = require("mqtt");

jest.mock("mqtt", () => {
  const mockClient = {
    publish: jest.fn((topic, mensagem, options, callback) => callback(null)),
    end: jest.fn(),
    on: jest.fn(), 
  };
  return {
    connect: jest.fn(() => mockClient),
  };
});

describe("Validação do Publisher de Telemetria MQTT", () => {
  test("deve enviar mensagem para o broker com sucesso", async () => {
    const dados = {
      plataforma: "Web",
      setor: "Geral",
      evento: "teste_ci",
    };

    await expect(
      enviarMensagemBroker("dsm/prod/app/interacao/tela", dados),
    ).resolves.not.toThrow();
  });

  test("deve rejeitar e tratar erro quando o publish falha", async () => {
    const mqttMock = mqtt.connect();

    const spyConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      mqttMock.publish.mockImplementationOnce(
        (topic, mensagem, options, callback) => {
          callback(new Error("Erro de conexão simulado"));
        },
      );

      const dados = { evento: "teste_falha" };

      await expect(
        enviarMensagemBroker("dsm/prod/app/interacao/tela", dados),
      ).rejects.toThrow("Erro de conexão simulado");
    } finally {
      spyConsoleError.mockRestore();
    }
  });
});