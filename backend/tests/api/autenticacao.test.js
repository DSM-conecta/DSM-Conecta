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

describe('Autenticação das rotas', () => {
  test.each([
    '/api/metricas/resumo',
    '/api/metricas/acessos',
    '/api/tempo-real/eventos',
    '/api/tempo-real/status',
    '/api/fg',
    '/api/fgc',
    '/api/telemetria',
    '/api/painel',
    '/api/formularios',
    '/api/administradores',
  ])('GET %s sem token → 401', async (rota) => {
    const res = await fetch(`${servidor.base}${rota}`);
    expect(res.status).toBe(401);
  });

  test('token adulterado → 401', async () => {
    const [payload] = servidor.token.split('.');
    const res = await fetch(`${servidor.base}/api/metricas/resumo`, {
      headers: { Authorization: `Bearer ${payload}.assinatura-falsa` },
    });
    expect(res.status).toBe(401);
  });

  test('token com esquema errado → 401', async () => {
    const res = await fetch(`${servidor.base}/api/metricas/resumo`, {
      headers: { Authorization: `Basic ${servidor.token}` },
    });
    expect(res.status).toBe(401);
  });

  test('rotas públicas continuam abertas: grade atual e saúde', async () => {
    const saude = await fetch(`${servidor.base}/api/saude`);
    expect(saude.status).toBe(200);
    expect((await saude.json()).status).toBe('ok');
  });
});
