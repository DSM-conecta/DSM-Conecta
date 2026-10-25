const Telemetria = require('../models/telemetria');
const Formulario = require('../models/formulario');
const Painel = require('../models/painel');
const FG = require('../models/fg');
const FGC = require('../models/fgc');

const FUSO_HORARIO = 'America/Sao_Paulo';

/**
 * Totais gerais do site: acessos, páginas visitadas, mensagens, respostas
 * dos formulários de pesquisa e data da última publicação da grade.
 */
async function resumo() {
  const [totalAcessos, setores, totalMensagens, totalFG, totalFGC, ultimaGrade] = await Promise.all([
    Telemetria.countDocuments(),
    Telemetria.distinct('setor'),
    Formulario.countDocuments(),
    FG.countDocuments(),
    FGC.countDocuments(),
    Painel.findOne({ setor: 'grade-curricular' }).sort({ createdAt: -1 }).select('createdAt'),
  ]);

  return {
    totalAcessos,
    paginasVisitadas: setores.length,
    totalMensagens,
    totalRespostasFG: totalFG,
    totalRespostasFGC: totalFGC,
    ultimaPublicacaoGrade: ultimaGrade?.createdAt || null,
    geradoEm: new Date().toISOString(),
  };
}

/**
 * Acessos agregados por página (setor), plataforma e dia.
 * @param {{dias?: number, setor?: string, plataforma?: string}} filtros
 *   `dias` limita o período (últimos N dias); sem ele, considera todo o histórico.
 */
async function acessos({ dias, setor, plataforma } = {}) {
  const filtro = {};

  if (dias) filtro.data = { $gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000) };
  if (setor) filtro.setor = setor;
  if (plataforma) filtro.plataforma = plataforma;

  const [resultado] = await Telemetria.aggregate([
    { $match: filtro },
    {
      $facet: {
        total: [{ $count: 'n' }],
        porSetor: [{ $group: { _id: '$setor', total: { $sum: 1 } } }, { $sort: { total: -1 } }],
        porPlataforma: [{ $group: { _id: '$plataforma', total: { $sum: 1 } } }, { $sort: { total: -1 } }],
        porDia: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$data', timezone: FUSO_HORARIO } },
              total: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const formatar = (lista = []) => lista.map(({ _id, total }) => ({ chave: _id, total }));

  return {
    periodoDias: dias || null,
    total: resultado?.total?.[0]?.n || 0,
    porSetor: formatar(resultado?.porSetor),
    porPlataforma: formatar(resultado?.porPlataforma),
    porDia: formatar(resultado?.porDia),
  };
}

module.exports = { resumo, acessos };
