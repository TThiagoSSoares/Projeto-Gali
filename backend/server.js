// server.js
// Entrada do servidor Express - Sistema Sorocaba Logistics

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./src/routes');
const cronService = require('./src/services/cron.service');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');
const { pool } = require('./src/config/db');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// --- Segurança e parsing ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limiting global (mais permissivo em dev) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use('/api/', limiter);

// --- Healthcheck ---
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'down', error: err.message });
  }
});

// --- Rotas da API ---
app.use('/api', routes);

// --- 404 + erro ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Startup ---
const server = app.listen(PORT, () => {
  console.log(`\n🟢 Sorocaba Logistics API rodando em http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/health\n`);
  cronService.start();
});

// --- Shutdown gracioso ---
const shutdown = async (signal) => {
  console.log(`\n[${signal}] encerrando servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app;
