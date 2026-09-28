const crypto = require('crypto');

// Configure ADMIN_TOKEN_SECRET in production. The process-local fallback keeps
// development sessions signed without adding another dependency.
const secret = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const duracaoTokenSegundos = 8 * 60 * 60;

function assinar(payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function gerarToken(id) {
  const payload = Buffer.from(JSON.stringify({
    id: String(id),
    exp: Math.floor(Date.now() / 1000) + duracaoTokenSegundos,
  })).toString('base64url');

  return `${payload}.${assinar(payload)}`;
}

function autenticar(req, res, next) {
  const autorizacao = req.get('Authorization') || '';
  const [tipo, token] = autorizacao.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Acesso administrativo necessário.' });
  }

  const [payload, assinatura, extra] = token.split('.');
  if (!payload || !assinatura || extra) {
    return res.status(401).json({ mensagem: 'Sessão administrativa inválida.' });
  }

  const assinaturaEsperada = Buffer.from(assinar(payload));
  const assinaturaRecebida = Buffer.from(assinatura);
  if (assinaturaEsperada.length !== assinaturaRecebida.length || !crypto.timingSafeEqual(assinaturaEsperada, assinaturaRecebida)) {
    return res.status(401).json({ mensagem: 'Sessão administrativa inválida.' });
  }

  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!dados.id || dados.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ mensagem: 'Sessão administrativa expirada.' });
    }
    req.admin = { id: dados.id };
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Sessão administrativa inválida.' });
  }
}

module.exports = { autenticar, gerarToken };
