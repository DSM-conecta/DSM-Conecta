const Telemetria = require('../../src/models/telemetria');
const Formulario = require('../../src/models/formulario');
const Painel = require('../../src/models/painel');
const FG = require('../../src/models/fg');
const FGC = require('../../src/models/fgc');
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

describe('GET /api/metricas/acessos', () => {
  test('agrega e formata os acessos por página, plataforma e dia', async () => {
    Telemetria.aggregate.mockResolvedValue([{
      total: [{ n: 5 }],
      porSetor: [{ _id: 'grade', total: 3 }, { _id: 'inicio', total: 2 }],
      porPlataforma: [{ _id: 'Web', total: 5 }],
      porDia: [{ _id: '2026-10-24', total: 2 }, { _id: '2026-10-25', total: 3 }],
    }]);

    const res = await fetch(`${servidor.base}/api/metricas/acessos`, { headers: servidor.authHeaders });
    const corpo = await res.json();

    expect(res.status).toBe(200);
    expect(corpo).toEqual({
      periodoDias: null,
      total: 5,
      porSetor: [{ chave: 'grade', total: 3 }, { chave: 'inicio', total: 2 }],
      porPlataforma: [{ chave: 'Web', total: 5 }],
      porDia: [{ chave: '2026-10-24', total: 2 }, { chave: '2026-10-25', total: 3 }],
    });
    // sem filtros: o $match deve estar vazio (todo o histórico)
    expect(Telemetria.aggregate.mock.calls[0][0][0]).toEqual({ $match: {} });
  });

  test('sem nenhum registro devolve zeros e listas vazias', async () => {
    Telemetria.aggregate.mockResolvedValue([{ total: [], porSetor: [], porPlataforma: [], porDia: [] }]);

    const res = await fetch(`${servidor.base}/api/metricas/acessos`, { headers: servidor.authHeaders });
    expect(await res.json()).toMatchObject({ total: 0, porSetor: [], porPlataforma: [], porDia: [] });
  });

  test('aplica filtros dias, setor e plataforma', async () => {
    Telemetria.aggregate.mockResolvedValue([{ total: [], porSetor: [], porPlataforma: [], porDia: [] }]);

    const res = await fetch(`${servidor.base}/api/metricas/acessos?dias=7&setor=grade&plataforma=Web`, { headers: servidor.authHeaders });
    expect((await res.json()).periodoDias).toBe(7);

    const { $match } = Telemetria.aggregate.mock.calls[0][0][0];
    expect($match.setor).toBe('grade');
    expect($match.plataforma).toBe('Web');
    expect($match.data.$gte).toBeInstanceOf(Date);
  });

  test.each(['0', '366', 'abc', '1.5', '-3'])('dias=%s → 400', async (dias) => {
    const res = await fetch(`${servidor.base}/api/metricas/acessos?dias=${dias}`, { headers: servidor.authHeaders });
    expect(res.status).toBe(400);
    expect(Telemetria.aggregate).not.toHaveBeenCalled();
  });

  test('filtros que não são texto simples são ignorados (sem injeção de operador)', async () => {
    Telemetria.aggregate.mockResolvedValue([{ total: [], porSetor: [], porPlataforma: [], porDia: [] }]);

    await fetch(`${servidor.base}/api/metricas/acessos?setor=a&setor=b&plataforma[$ne]=x`, { headers: servidor.authHeaders });
    expect(Telemetria.aggregate.mock.calls[0][0][0]).toEqual({ $match: {} });
  });

  test('erro de banco → 500 em JSON', async () => {
    Telemetria.aggregate.mockRejectedValue(new Error('banco indisponível'));
    const res = await fetch(`${servidor.base}/api/metricas/acessos`, { headers: servidor.authHeaders });
    expect(res.status).toBe(500);
    expect((await res.json()).mensagem).toBe('banco indisponível');
  });
});

describe('GET /api/metricas/resumo', () => {
  test('junta totais de acessos, mensagens, pesquisas e estado do tempo real', async () => {
    const criadoEm = new Date('2026-10-20T12:00:00Z');
    Telemetria.countDocuments.mockResolvedValue(120);
    Telemetria.distinct.mockResolvedValue(['inicio', 'grade', 'sobre']);
    Formulario.countDocuments.mockResolvedValue(7);
    FG.countDocuments.mockResolvedValue(4);
    FGC.countDocuments.mockResolvedValue(2);
    Painel.findOne.mockReturnValue({ sort: () => ({ select: () => Promise.resolve({ createdAt: criadoEm }) }) });

    const res = await fetch(`${servidor.base}/api/metricas/resumo`, { headers: servidor.authHeaders });
    const corpo = await res.json();

    expect(res.status).toBe(200);
    expect(corpo).toMatchObject({
      totalAcessos: 120,
      paginasVisitadas: 3,
      totalMensagens: 7,
      totalRespostasFG: 4,
      totalRespostasFGC: 2,
      ultimaPublicacaoGrade: criadoEm.toISOString(),
    });
    expect(corpo.tempoReal.mqtt).toHaveProperty('conectado');
    expect(corpo.tempoReal).toHaveProperty('clientesConectados');
  });
});
