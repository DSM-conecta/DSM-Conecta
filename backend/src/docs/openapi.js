// Especificação OpenAPI 3.0 da API do DSM Conecta.
// Servida em /api/openapi.json e exibida em /api/docs (Swagger UI).
//
// IMPORTANTE: ao criar ou alterar uma rota, atualize este arquivo.
// O teste tests/api/docs.test.js confere se cada rota documentada existe e se
// as rotas marcadas como protegidas realmente exigem autenticação.

const respostaErro = (descricao) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
});

const naoAutenticado = respostaErro('Token ausente, inválido ou expirado.');
const naoEncontrado = respostaErro('Registro não encontrado.');
const requisicaoInvalida = respostaErro('Dados inválidos.');

const protegido = [{ bearerAuth: [] }];

const parametroId = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID do registro (ObjectId do MongoDB).',
  schema: { type: 'string', example: '665f1c2e8b3a4d0012ab34cd' },
};

const json = (schema) => ({ 'application/json': { schema } });
const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` });
const listaDe = (nome) => ({ type: 'array', items: ref(nome) });

// ---- Formulários de pesquisa (FG e FGC): 10 perguntas cada ----
function schemasPesquisa(prefixo) {
  const perguntas = {};
  for (let i = 1; i <= 10; i += 1) {
    perguntas[`${prefixo}${i}`] = i === 2
      ? { type: 'string', description: 'Nota de 1 a 5.', example: '5' }
      : { type: 'string', example: 'Resposta' };
  }
  const entrada = {
    type: 'object',
    required: ['name', 'email', ...Object.keys(perguntas)],
    properties: {
      name: { type: 'string', example: 'Maria Souza' },
      email: { type: 'string', format: 'email', example: 'maria@email.com' },
      ...perguntas,
    },
  };
  return {
    entrada,
    registro: {
      allOf: [
        { type: 'object', properties: { _id: { type: 'string' } } },
        entrada,
      ],
    },
  };
}

function caminhosPesquisa(base, tag, nomeEntrada, nomeRegistro, titulo) {
  return {
    [base]: {
      post: {
        tags: [tag],
        summary: `Enviar resposta do ${titulo}`,
        description: 'Público: qualquer visitante pode responder. Todas as perguntas são obrigatórias e a pergunta 2 é uma nota de 1 a 5.',
        requestBody: { required: true, content: json(ref(nomeEntrada)) },
        responses: {
          201: { description: 'Resposta registrada.', content: json(ref(nomeRegistro)) },
          400: requisicaoInvalida,
        },
      },
      get: {
        tags: [tag],
        summary: `Listar respostas do ${titulo}`,
        security: protegido,
        parameters: [{ name: 'email', in: 'query', description: 'Filtra por e-mail.', schema: { type: 'string' } }],
        responses: { 200: { description: 'Lista de respostas.', content: json(listaDe(nomeRegistro)) }, 401: naoAutenticado },
      },
    },
    [`${base}/{id}`]: {
      get: {
        tags: [tag],
        summary: 'Buscar resposta por ID',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Resposta encontrada.', content: json(ref(nomeRegistro)) }, 401: naoAutenticado, 404: naoEncontrado },
      },
      put: {
        tags: [tag],
        summary: 'Atualizar resposta',
        security: protegido,
        parameters: [parametroId],
        requestBody: { required: true, content: json(ref(nomeEntrada)) },
        responses: { 200: { description: 'Resposta atualizada.', content: json(ref(nomeRegistro)) }, 400: requisicaoInvalida, 401: naoAutenticado, 404: naoEncontrado },
      },
      delete: {
        tags: [tag],
        summary: 'Remover resposta',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Resposta removida.', content: json(ref('Mensagem')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
    },
  };
}

const fg = schemasPesquisa('QG');
const fgc = schemasPesquisa('QGC');

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'DSM Conecta — API',
    version: '1.0.0',
    description: [
      'API do site DSM Conecta (Fatec Zona Sul).',
      '',
      '**Autenticação:** faça login em `POST /administradores/login` e envie o token recebido no cabeçalho `Authorization: Bearer <token>`. O token vale 8 horas. No Swagger UI, clique em **Authorize** e cole apenas o token.',
      '',
      '**Tempo real:** `GET /tempo-real/eventos` abre um fluxo Server-Sent Events com as visitas, mensagens e publicações assim que acontecem. A telemetria chega ao servidor por MQTT (`dsm/#`) ou por `POST /telemetria`.',
      '',
      'Rotas marcadas com o cadeado exigem token de administrador.',
    ].join('\n'),
  },
  servers: [{ url: '/api', description: 'Servidor atual' }],
  tags: [
    { name: 'Autenticação', description: 'Login de administradores.' },
    { name: 'Conteúdo', description: 'Conteúdo editável do site (painel/grade curricular) e mensagens do formulário de contato.' },
    { name: 'Métricas', description: 'Estatísticas de acesso e resumo do site.' },
    { name: 'Tempo real', description: 'Canal em tempo real (SSE) e estado do canal MQTT.' },
    { name: 'Telemetria', description: 'Registros de visitas/eventos (via HTTP ou MQTT).' },
    { name: 'Administradores', description: 'Gerenciamento de contas administrativas.' },
    { name: 'Pesquisa FG', description: 'Formulário de pesquisa geral.' },
    { name: 'Pesquisa FGC', description: 'Formulário de pesquisa do curso.' },
    { name: 'Sistema', description: 'Saúde do servidor.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token assinado (HMAC-SHA256)',
        description: 'Token obtido em POST /administradores/login.',
      },
    },
    schemas: {
      Erro: { type: 'object', properties: { mensagem: { type: 'string', example: 'Acesso administrativo necessário.' } } },
      Mensagem: { type: 'object', properties: { mensagem: { type: 'string', example: 'Registro removido com sucesso.' } } },
      LoginEntrada: {
        type: 'object',
        required: ['email', 'senha'],
        properties: { email: { type: 'string', format: 'email', example: 'admin@exemplo.com' }, senha: { type: 'string', format: 'password' } },
      },
      Administrador: {
        type: 'object',
        properties: { _id: { type: 'string' }, nome: { type: 'string', example: 'Ana Admin' }, email: { type: 'string', format: 'email' } },
      },
      AdministradorEntrada: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: { nome: { type: 'string' }, email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password' } },
      },
      LoginResposta: {
        allOf: [ref('Administrador'), { type: 'object', properties: { token: { type: 'string', description: 'Enviar em Authorization: Bearer <token>.' } } }],
      },
      Telemetria: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          topic: { type: 'string', example: 'dsm/prod/app/interacao/tela' },
          plataforma: { type: 'string', example: 'Web' },
          setor: { type: 'string', example: 'grade', description: 'Página/área visitada.' },
          data: { type: 'string', format: 'date-time' },
          hora: { type: 'string', example: '21:35' },
        },
      },
      TelemetriaEntrada: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Opcional. Se omitido, usa http/<plataforma>/<setor>.' },
          plataforma: { type: 'string', default: 'Web' },
          setor: { type: 'string', default: 'Geral' },
          data: { type: 'string', format: 'date-time', description: 'Padrão: agora.' },
          hora: { type: 'string', description: 'Padrão: hora atual (HH:MM).' },
        },
      },
      Painel: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          setor: { type: 'string', example: 'grade-curricular' },
          texto: { type: 'string', description: 'Conteúdo publicado (uma disciplina por linha na grade).' },
          imagemUrl: { type: 'string', example: '/assets/imgs/Fatec_zona_sul.jpg' },
          administrador: { type: 'object', properties: { _id: { type: 'string' }, nome: { type: 'string' }, email: { type: 'string' } } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PainelEntrada: {
        type: 'object',
        required: ['setor', 'texto', 'imagemUrl'],
        description: 'O autor é definido pelo servidor a partir do token; não envie `administrador`.',
        properties: {
          setor: { type: 'string', example: 'grade-curricular' },
          texto: { type: 'string', example: 'Algoritmo e Lógica de Programação\nDesign Digital' },
          imagemUrl: { type: 'string', example: '/assets/imgs/Fatec_zona_sul.jpg' },
        },
      },
      GradeAtual: { type: 'object', properties: { texto: { type: 'string', description: 'Texto da versão mais recente (vazio se não houver).' } } },
      Formulario: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nome: { type: 'string', maxLength: 120 },
          email: { type: 'string', maxLength: 180 },
          assunto: { type: 'string', maxLength: 80 },
          mensagem: { type: 'string', maxLength: 1500 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FormularioEntrada: {
        type: 'object',
        required: ['nome', 'email', 'assunto', 'mensagem'],
        properties: {
          nome: { type: 'string', maxLength: 120, example: 'João' },
          email: { type: 'string', maxLength: 180, example: 'joao@email.com' },
          assunto: { type: 'string', maxLength: 80, example: 'Dúvida sobre o curso' },
          mensagem: { type: 'string', maxLength: 1500, example: 'Gostaria de saber mais sobre o DSM.' },
        },
      },
      ContagemPorChave: {
        type: 'object',
        properties: { chave: { type: 'string', example: 'grade' }, total: { type: 'integer', example: 42 } },
      },
      MetricasAcessos: {
        type: 'object',
        properties: {
          periodoDias: { type: 'integer', nullable: true, description: 'Período filtrado; null = todo o histórico.' },
          total: { type: 'integer' },
          porSetor: { type: 'array', description: 'Acessos por página, do maior para o menor.', items: ref('ContagemPorChave') },
          porPlataforma: { type: 'array', items: ref('ContagemPorChave') },
          porDia: { type: 'array', description: 'Acessos por dia (AAAA-MM-DD, fuso America/Sao_Paulo), em ordem cronológica.', items: ref('ContagemPorChave') },
        },
      },
      EstadoMqtt: {
        type: 'object',
        properties: {
          habilitado: { type: 'boolean' },
          conectado: { type: 'boolean', description: 'Conectado ao broker agora.' },
          broker: { type: 'string', nullable: true, example: 'mqtt://localhost:1883' },
          topico: { type: 'string', nullable: true, example: 'dsm/#' },
          mensagensRecebidas: { type: 'integer' },
          mensagensSalvas: { type: 'integer' },
          ultimaMensagemEm: { type: 'string', format: 'date-time', nullable: true },
          ultimoErro: { type: 'string', nullable: true },
        },
      },
      StatusTempoReal: {
        type: 'object',
        properties: {
          sse: { type: 'object', properties: { clientesConectados: { type: 'integer' } } },
          mqtt: ref('EstadoMqtt'),
        },
      },
      MetricasResumo: {
        type: 'object',
        properties: {
          totalAcessos: { type: 'integer' },
          paginasVisitadas: { type: 'integer' },
          totalMensagens: { type: 'integer' },
          totalRespostasFG: { type: 'integer' },
          totalRespostasFGC: { type: 'integer' },
          ultimaPublicacaoGrade: { type: 'string', format: 'date-time', nullable: true },
          geradoEm: { type: 'string', format: 'date-time' },
          tempoReal: { type: 'object', properties: { mqtt: ref('EstadoMqtt'), clientesConectados: { type: 'integer' } } },
        },
      },
      Saude: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          banco: { type: 'string', enum: ['conectado', 'desconectado'] },
          mqtt: ref('EstadoMqtt'),
          uptimeSegundos: { type: 'integer' },
        },
      },
      FGEntrada: fg.entrada,
      FG: fg.registro,
      FGCEntrada: fgc.entrada,
      FGC: fgc.registro,
    },
  },
  paths: {
    '/administradores/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Entrar como administrador',
        description: 'Retorna os dados do administrador e um token Bearer válido por 8 horas.',
        requestBody: { required: true, content: json(ref('LoginEntrada')) },
        responses: { 200: { description: 'Login realizado.', content: json(ref('LoginResposta')) }, 401: respostaErro('E-mail ou senha inválidos.') },
      },
    },

    // ---------- Conteúdo ----------
    '/painel/grade-atual': {
      get: {
        tags: ['Conteúdo'],
        summary: 'Grade curricular publicada',
        description: 'Público. Usado pela página pública da grade; devolve só o texto, sem dados de auditoria.',
        responses: { 200: { description: 'Texto da versão mais recente.', content: json(ref('GradeAtual')) } },
      },
    },
    '/painel': {
      get: {
        tags: ['Conteúdo'],
        summary: 'Listar publicações (histórico)',
        security: protegido,
        parameters: [{ name: 'setor', in: 'query', description: 'Filtra por setor, ex.: grade-curricular.', schema: { type: 'string' } }],
        responses: { 200: { description: 'Da mais recente para a mais antiga.', content: json(listaDe('Painel')) }, 401: naoAutenticado },
      },
      post: {
        tags: ['Conteúdo'],
        summary: 'Publicar nova versão de um conteúdo',
        description: 'O autor é o administrador do token. Dispara o evento `painel` no canal em tempo real.',
        security: protegido,
        requestBody: { required: true, content: json(ref('PainelEntrada')) },
        responses: { 201: { description: 'Publicado.', content: json(ref('Painel')) }, 400: requisicaoInvalida, 401: naoAutenticado },
      },
    },
    '/painel/{id}': {
      get: {
        tags: ['Conteúdo'],
        summary: 'Buscar publicação por ID',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Publicação.', content: json(ref('Painel')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
      put: {
        tags: ['Conteúdo'],
        summary: 'Atualizar publicação',
        security: protegido,
        parameters: [parametroId],
        requestBody: { required: true, content: json(ref('PainelEntrada')) },
        responses: { 200: { description: 'Atualizada.', content: json(ref('Painel')) }, 400: requisicaoInvalida, 401: naoAutenticado },
      },
      delete: {
        tags: ['Conteúdo'],
        summary: 'Remover publicação',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Removida.', content: json(ref('Mensagem')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
    },
    '/formularios': {
      post: {
        tags: ['Conteúdo'],
        summary: 'Enviar mensagem pelo formulário de contato',
        description: 'Público. Dispara o evento `formulario` no canal em tempo real.',
        requestBody: { required: true, content: json(ref('FormularioEntrada')) },
        responses: {
          201: { description: 'Mensagem recebida.', content: json({ type: 'object', properties: { mensagem: { type: 'string' }, id: { type: 'string' } } }) },
          400: requisicaoInvalida,
        },
      },
      get: {
        tags: ['Conteúdo'],
        summary: 'Listar mensagens recebidas',
        security: protegido,
        responses: { 200: { description: 'Da mais recente para a mais antiga.', content: json(listaDe('Formulario')) }, 401: naoAutenticado },
      },
    },

    // ---------- Métricas ----------
    '/metricas/resumo': {
      get: {
        tags: ['Métricas'],
        summary: 'Resumo geral do site',
        description: 'Totais de acessos, páginas, mensagens e respostas, mais o estado do canal em tempo real.',
        security: protegido,
        responses: { 200: { description: 'Resumo.', content: json(ref('MetricasResumo')) }, 401: naoAutenticado },
      },
    },
    '/metricas/acessos': {
      get: {
        tags: ['Métricas'],
        summary: 'Acessos agregados',
        description: 'Agrupa as visitas por página, plataforma e dia.',
        security: protegido,
        parameters: [
          { name: 'dias', in: 'query', description: 'Últimos N dias (1–365). Omita para todo o histórico.', schema: { type: 'integer', minimum: 1, maximum: 365 } },
          { name: 'setor', in: 'query', description: 'Filtra por página.', schema: { type: 'string' } },
          { name: 'plataforma', in: 'query', description: 'Filtra por plataforma (Web, Mobile…).', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Métricas.', content: json(ref('MetricasAcessos')) }, 400: requisicaoInvalida, 401: naoAutenticado },
      },
    },

    // ---------- Tempo real ----------
    '/tempo-real/eventos': {
      get: {
        tags: ['Tempo real'],
        summary: 'Fluxo de eventos em tempo real (SSE)',
        description: [
          'Conexão aberta (`text/event-stream`). Eventos enviados:',
          '',
          '- `status` — ao conectar: estado do MQTT e nº de clientes;',
          '- `telemetria` — nova visita/evento salvo (HTTP ou MQTT);',
          '- `formulario` — nova mensagem de contato;',
          '- `painel` — conteúdo publicado/alterado;',
          '- `sessao-expirada` — o token venceu e a conexão será encerrada.',
          '',
          'Comentários `: ping` são enviados a cada 25 s para manter a conexão viva.',
          'O navegador `EventSource` não envia cabeçalhos; use `fetch` com `Authorization` (veja `frontend/js/admin.js`) ou `curl -N`.',
        ].join('\n'),
        security: protegido,
        responses: {
          200: { description: 'Fluxo SSE aberto.', content: { 'text/event-stream': { schema: { type: 'string' } } } },
          401: naoAutenticado,
          503: respostaErro('Limite de conexões simultâneas atingido.'),
        },
      },
    },
    '/tempo-real/status': {
      get: {
        tags: ['Tempo real'],
        summary: 'Estado do canal em tempo real',
        description: 'Informa se o servidor está conectado ao broker MQTT e quantos painéis estão ligados ao fluxo SSE.',
        security: protegido,
        responses: { 200: { description: 'Estado atual.', content: json(ref('StatusTempoReal')) }, 401: naoAutenticado },
      },
    },

    // ---------- Telemetria ----------
    '/telemetria': {
      post: {
        tags: ['Telemetria'],
        summary: 'Registrar visita/evento',
        description: 'Público (chamado pelas páginas do site). Também é possível publicar via MQTT em `dsm/#`.',
        requestBody: { required: false, content: json(ref('TelemetriaEntrada')) },
        responses: { 201: { description: 'Registrado.', content: json(ref('Telemetria')) }, 400: requisicaoInvalida },
      },
      get: {
        tags: ['Telemetria'],
        summary: 'Listar registros',
        description: 'Para totais e gráficos prefira `GET /metricas/acessos`.',
        security: protegido,
        parameters: [
          { name: 'plataforma', in: 'query', schema: { type: 'string' } },
          { name: 'setor', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Registros, do mais recente ao mais antigo.', content: json(listaDe('Telemetria')) }, 401: naoAutenticado },
      },
    },
    '/telemetria/{id}': {
      get: {
        tags: ['Telemetria'],
        summary: 'Buscar registro por ID',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Registro.', content: json(ref('Telemetria')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
      put: {
        tags: ['Telemetria'],
        summary: 'Atualizar registro',
        security: protegido,
        parameters: [parametroId],
        requestBody: { required: true, content: json(ref('TelemetriaEntrada')) },
        responses: { 200: { description: 'Atualizado.', content: json(ref('Telemetria')) }, 400: requisicaoInvalida, 401: naoAutenticado, 404: naoEncontrado },
      },
      delete: {
        tags: ['Telemetria'],
        summary: 'Remover registro',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Removido.', content: json(ref('Mensagem')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
    },

    // ---------- Administradores ----------
    '/administradores': {
      get: {
        tags: ['Administradores'],
        summary: 'Listar administradores',
        security: protegido,
        responses: { 200: { description: 'Lista (sem senhas).', content: json(listaDe('Administrador')) }, 401: naoAutenticado },
      },
      post: {
        tags: ['Administradores'],
        summary: 'Criar administrador',
        description: 'A primeira conta é criada pelo script `npm run admin:create`.',
        security: protegido,
        requestBody: { required: true, content: json(ref('AdministradorEntrada')) },
        responses: { 201: { description: 'Criado.', content: json(ref('Administrador')) }, 400: requisicaoInvalida, 401: naoAutenticado },
      },
    },
    '/administradores/{id}': {
      get: {
        tags: ['Administradores'],
        summary: 'Buscar administrador por ID',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Administrador.', content: json(ref('Administrador')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
      put: {
        tags: ['Administradores'],
        summary: 'Atualizar administrador',
        description: 'Se `senha` for enviada, é regravada com hash.',
        security: protegido,
        parameters: [parametroId],
        requestBody: { required: true, content: json(ref('AdministradorEntrada')) },
        responses: { 200: { description: 'Atualizado.', content: json(ref('Administrador')) }, 400: requisicaoInvalida, 401: naoAutenticado, 404: naoEncontrado },
      },
      delete: {
        tags: ['Administradores'],
        summary: 'Remover administrador',
        security: protegido,
        parameters: [parametroId],
        responses: { 200: { description: 'Removido.', content: json(ref('Mensagem')) }, 401: naoAutenticado, 404: naoEncontrado },
      },
    },

    // ---------- Pesquisas ----------
    ...caminhosPesquisa('/fg', 'Pesquisa FG', 'FGEntrada', 'FG', 'formulário geral (FG)'),
    ...caminhosPesquisa('/fgc', 'Pesquisa FGC', 'FGCEntrada', 'FGC', 'formulário do curso (FGC)'),

    // ---------- Sistema ----------
    '/saude': {
      get: {
        tags: ['Sistema'],
        summary: 'Saúde do servidor',
        description: 'Público. Mostra se o banco e o canal MQTT estão conectados.',
        responses: { 200: { description: 'Estado atual.', content: json(ref('Saude')) } },
      },
    },
  },
};

module.exports = openapi;
