const { iniciarServidor, ID_FALSO } = require('./helpers');

jest.mock('../../src/models/adm');
jest.mock('../../src/models/telemetria');
jest.mock('../../src/models/formulario');
jest.mock('../../src/models/painel');
jest.mock('../../src/models/fg');
jest.mock('../../src/models/fgc');
jest.mock('../../src/services/painelService');

const painelService = require('../../src/services/painelService');

let servidor;
beforeAll(async () => { servidor = await iniciarServidor(); });
afterAll(async () => { await servidor.fechar(); });
beforeEach(() => jest.clearAllMocks());

const enviar = (rota, metodo, corpo) => fetch(`${servidor.base}/api/painel${rota}`, {
  method: metodo,
  headers: { ...servidor.authHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

describe('Autoria das publicações do painel', () => {
  test('o autor ao publicar vem do token, mesmo que o corpo informe outro administrador', async () => {
    painelService.criarPainel.mockResolvedValue({ _id: 'p1', setor: 'grade-curricular' });

    const res = await enviar('', 'POST', {
      setor: 'grade-curricular', texto: 'Algoritmos', imagemUrl: '/x.jpg', administrador: 'id-de-outra-pessoa',
    });

    expect(res.status).toBe(201);
    expect(painelService.criarPainel).toHaveBeenCalledWith(expect.objectContaining({ administrador: ID_FALSO }));
  });

  test('atualizar não permite trocar o autor', async () => {
    painelService.atualizarPainel.mockResolvedValue({ _id: 'p1', setor: 'grade-curricular' });

    await enviar(`/${ID_FALSO}`, 'PUT', { texto: 'novo', administrador: 'id-de-outra-pessoa' });

    const [, dados] = painelService.atualizarPainel.mock.calls[0];
    expect(dados).toEqual({ texto: 'novo' });
  });

  test('a grade pública não exige login e devolve só o texto', async () => {
    painelService.listarPainel.mockResolvedValue([{ texto: 'Design Digital', administrador: { nome: 'secreto' } }]);

    const res = await fetch(`${servidor.base}/api/painel/grade-atual`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ texto: 'Design Digital' });
  });
});
