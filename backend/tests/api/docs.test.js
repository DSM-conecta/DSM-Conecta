const openapi = require('../../src/docs/openapi');
const { iniciarServidor, ID_FALSO } = require('./helpers');

jest.mock('../../src/models/adm');
jest.mock('../../src/models/telemetria');
jest.mock('../../src/models/formulario');
jest.mock('../../src/models/painel');
jest.mock('../../src/models/fg');
jest.mock('../../src/models/fgc');

let servidor;
beforeAll(async () => { servidor = await iniciarServidor(); });
afterAll(async () => { await servidor.fechar(); });

const operacoes = Object.entries(openapi.paths).flatMap(([caminho, metodos]) =>
  Object.entries(metodos).map(([metodo, op]) => ({ caminho, metodo, op })));

describe('Documentação da API (OpenAPI)', () => {
  test('GET /api/openapi.json devolve a especificação', async () => {
    const res = await fetch(`${servidor.base}/api/openapi.json`);
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo.openapi).toMatch(/^3\./);
    expect(Object.keys(corpo.paths).length).toBeGreaterThan(10);
  });

  test('GET /api/docs serve a página do Swagger UI apontando para a especificação', async () => {
    const res = await fetch(`${servidor.base}/api/docs`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    const html = await res.text();
    expect(html).toContain('SwaggerUIBundle');
    expect(html).toContain('"/api/openapi.json"');
  });

  test('todos os $ref da especificação apontam para schemas existentes', () => {
    const referencias = [...JSON.stringify(openapi).matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)].map((m) => m[1]);
    expect(referencias.length).toBeGreaterThan(0);
    referencias.forEach((nome) => expect(openapi.components.schemas[nome]).toBeDefined());
  });

  test('a documentação cobre conteúdo, métricas e tempo real', () => {
    expect(openapi.paths['/painel']).toBeDefined();
    expect(openapi.paths['/formularios']).toBeDefined();
    expect(openapi.paths['/metricas/resumo']).toBeDefined();
    expect(openapi.paths['/metricas/acessos']).toBeDefined();
    expect(openapi.paths['/tempo-real/eventos']).toBeDefined();
  });
});

describe('A API real bate com o que está documentado', () => {
  test.each(operacoes.map((o) => [`${o.metodo.toUpperCase()} ${o.caminho}`, o]))('%s', async (_nome, { caminho, metodo, op }) => {
    // /tempo-real/eventos abre uma conexão que nunca fecha; é coberto em tempoReal.test.js.
    if (caminho === '/tempo-real/eventos') return;

    const url = `${servidor.base}/api${caminho.replace('{id}', ID_FALSO)}`;
    const init = { method: metodo.toUpperCase(), headers: { 'Content-Type': 'application/json' } };
    if (['post', 'put'].includes(metodo)) init.body = '{}';

    const res = await fetch(url, init); // sem token

    if (op.security) {
      // Rota documentada como protegida → tem que recusar quem não está logado.
      expect(res.status).toBe(401);
    } else {
      // Rota pública → tem que existir (o 404 padrão do Express é HTML, o da API é JSON).
      const ehRotaInexistente = res.status === 404 && !(res.headers.get('content-type') || '').includes('json');
      expect(ehRotaInexistente).toBe(false);
      // (o login responde 401 para senha errada, então conferimos a mensagem e não o status)
      const corpo = await res.json().catch(() => ({}));
      expect(corpo.mensagem || '').not.toMatch(/acesso administrativo necessário/i);
    }
  });
});

describe('Rotas fora da documentação', () => {
  test('rota inexistente em /api responde 404 em JSON', async () => {
    const res = await fetch(`${servidor.base}/api/nao-existe`);
    expect(res.status).toBe(404);
    expect((await res.json()).mensagem).toMatch(/não encontrada/i);
  });

  test('JSON malformado responde 400 em JSON', async () => {
    const res = await fetch(`${servidor.base}/api/telemetria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{quebrado',
    });
    expect(res.status).toBe(400);
    expect((await res.json()).mensagem).toBeDefined();
  });

  test('o endereço antigo (sem /api) continua funcionando para o front-end atual', async () => {
    const res = await fetch(`${servidor.base}/formularios`);
    expect(res.status).toBe(401);
  });
});
