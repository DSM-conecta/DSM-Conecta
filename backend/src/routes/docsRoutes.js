const express = require('express');
const openapi = require('../docs/openapi');

const router = express.Router();

// Versão fixa do Swagger UI carregada por CDN (nenhuma dependência npm extra).
const SWAGGER_UI_VERSION = '5.17.14';

const pagina = (urlEspecificacao) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentação da API | DSM Conecta</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: ${JSON.stringify(urlEspecificacao)},
      dom_id: '#swagger-ui',
      persistAuthorization: true,
      tagsSorter: 'alpha',
      docExpansion: 'list'
    });
  </script>
</body>
</html>`;

router.get('/openapi.json', (req, res) => res.status(200).json(openapi));

// O Swagger UI busca a especificação no mesmo prefixo em que foi aberto
// (/api/docs → /api/openapi.json; /docs → /openapi.json).
router.get('/docs', (req, res) => {
  res.status(200).type('html').send(pagina(`${req.baseUrl}/openapi.json`));
});

module.exports = router;
