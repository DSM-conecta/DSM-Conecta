const mockClient = {
    publish: jest.fn((topic, mensagem, options, callback) => callback(null)),
    end: jest.fn(),
    on: jest.fn(),
};

jest.mock("mqtt", () => ({
    connect: jest.fn(() => mockClient),
}));

const { enviarMensagemBroker } = require("../../src/mqtt/telemetriaPublisher");

describe("Validação do Publisher de Telemetria MQTT", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("deve enviar mensagem para o broker com sucesso", async () => {
        const dados = {
            plataforma: "Web",
            setor: "Geral",
            evento: "teste_ci",
            data: new Date().toISOString(),
            hora: "21:35",
        };

        await expect(
            enviarMensagemBroker("dsm/prod/app/interacao/tela", dados)
        ).resolves.not.toThrow();
    });

    test("deve rejeitar e tratar erro quando o publish falha", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        try {
            mockClient.publish.mockImplementationOnce(
                (topic, mensagem, options, callback) => {
                    callback(new Error("Erro de conexão simulado"));
                }
            );

            const dados = { evento: "teste_falha" };

            await expect(
                enviarMensagemBroker("dsm/prod/app/interacao/tela", dados)
            ).rejects.toThrow("Erro de conexão simulado");
        } finally {
            spyConsoleError.mockRestore();
        }
    });
});