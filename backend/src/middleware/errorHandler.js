// src/middleware/errorHandler.js
// Tratamento centralizado de erros

/**
 * Classe utilitária para erros HTTP "controlados" (lançados por controllers).
 * Ex.: throw new HttpError(409, 'Capacidade excedida', { sugestao: {...} })
 */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// 404 (quando nenhuma rota bateu)
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'not_found',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Erros conhecidos do PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'conflict',
      message: 'Registro duplicado.',
      details: err.detail,
    });
  }
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'foreign_key_violation',
      message: 'Referência inválida a registro inexistente.',
    });
  }

  console.error('[error]', err);
  return res.status(500).json({
    error: 'internal_error',
    message: 'Erro interno do servidor.',
  });
}

module.exports = { HttpError, notFoundHandler, errorHandler };
