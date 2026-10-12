const { salvarTelemetria } = require('../../src/services/telemetriaService');
const Telemetria = require('../../src/models/telemetria');

jest.mock('../../src/models/telemetria');

describe('Testes do Subscriber e Persistência de Telemetria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve salvar a telemetria com sucesso quando os dados são inéditos', async () => {
    Telemetria.prototype.save = jest.fn().mockResolvedValue({
      topic: 'dsm/prod/app/interacao/tela',
      plataforma: 'Web',
      setor: 'Geral'
    });

    const payload = {
      topic: 'dsm/prod/app/interacao/tela',
      plataforma: 'Web',
      setor: 'Geral',
      data: new Date(),
      hora: '21:00:00'
    };

    await expect(salvarTelemetria(payload)).resolves.not.toThrow();
  });

  test('deve capturar e tratar o erro 11000 de chave duplicada corretamente', async () => {
    const duplicateError = new Error('Duplicate Key Error');
    duplicateError.code = 11000;

    Telemetria.prototype.save = jest.fn().mockRejectedValue(duplicateError);

    const payloadDuplicado = {
      topic: 'dsm/prod/app/interacao/tela',
      plataforma: 'Web',
      setor: 'Geral',
      data: new Date(),
      hora: '21:00:00'
    };

    await expect(salvarTelemetria(payloadDuplicado)).rejects.toMatchObject({
      code: 11000
    });
  });
});