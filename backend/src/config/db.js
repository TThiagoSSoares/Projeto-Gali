// src/config/db.js
// Pool de conexões com PostgreSQL (node-postgres)

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Em produção (Heroku/DO/RDS) costuma exigir SSL.
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] Erro inesperado no pool PostgreSQL:', err);
});

/**
 * Executa uma query parametrizada.
 * @param {string} text  SQL com placeholders $1, $2 …
 * @param {Array} params Valores
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[db] ${duration}ms — ${text.split('\n')[0].slice(0, 80)}`);
  }
  return result;
}

/**
 * Executa um bloco de queries dentro de uma transação.
 * O callback recebe um client "transacional" com .query().
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
