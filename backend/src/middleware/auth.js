// src/middleware/auth.js
// Middleware de autenticação JWT + autorização por role

const jwt = require('jsonwebtoken');

/**
 * Verifica o JWT no header Authorization: Bearer <token>.
 * Em caso de sucesso, adiciona req.user com { id, email, tipo }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Token de acesso ausente. Use Authorization: Bearer <token>.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, tipo: payload.tipo };
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token inválido ou expirado.',
    });
  }
}

/**
 * Exige que o usuário tenha um dos roles especificados.
 * Uso: requireRole('admin') ou requireRole('admin', 'voluntario')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Acesso restrito ao(s) papel(éis): ${roles.join(', ')}.`,
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
