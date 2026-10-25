const FG = require('../../src/models/fg');
const { iniciarServidor } = require('./helpers');

jest.mock('../../src/models/adm');
jest.mock('../../src/models/telemetria');
jest.mock('../../src/models/formulario');
jest.mock('../../src/models/painel');
jest.mock('../../src/models/fg');
jest.mock('../../src/models/fgc');

let servidor;
beforeAll(async () => { servidor = await iniciarServidor(); });
afterAll(async () => { await servidor.fechar(); });
beforeEach(() => jest.clearAllMocks());

const post = (rota, corpo) => fetch(`${servidor.base}/api${rota}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

describe('Formulários de pesquisa (FG/FGC)', () => {
  // Regressão: o controller tinha um `exports.criar` aninhado, então a PRIMEIRA
  // requisição pulava a validação e só as seguintes eram validadas.
  test.each(['/fg', '/fgc'])('POST %s valida já na primeira requisição (corpo inválido → 400)', async (rota) => {
    const res = await post(rota, { name: '', email: 'invalido' });
    expect(res.status).toBe(400);
    expect((await res.json()).mensagem).toMatch(/inválidos/i);
    expect(FG).not.toHaveBeenCalled();
  });

  test('POST /fg com corpo válido grava a resposta', async () => {
    FG.mockImplementation(function (dados) {
      Object.assign(this, dados, { _id: 'r1' });
      this.save = jest.fn().mockResolvedValue(this);
      this.toJSON = () => ({ ...dados, _id: 'r1' }); // o automock devolveria undefined
    });
    const corpo = { name: 'Lucas', email: 'lucas@email.com', QG2: '5' };
    for (let i = 1; i <= 10; i += 1) if (i !== 2) corpo[`QG${i}`] = 'ok';

    const res = await post('/fg', corpo);
    expect(res.status).toBe(201);
    expect((await res.json())._id).toBe('r1');
  });

  test('ler/alterar/remover respostas exige login; enviar não', async () => {
    const ler = await fetch(`${servidor.base}/api/fg`);
    expect(ler.status).toBe(401);
    const apagar = await fetch(`${servidor.base}/api/fg/665f1c2e8b3a4d0012ab34cd`, { method: 'DELETE' });
    expect(apagar.status).toBe(401);

    const comToken = await fetch(`${servidor.base}/api/fg`, { headers: servidor.authHeaders });
    expect(comToken.status).not.toBe(401);
  });
});
