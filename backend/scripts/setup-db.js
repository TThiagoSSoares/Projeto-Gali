// scripts/setup-db.js
// Aplica schema.sql + seeds.sql no banco configurado em .env

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const seeds  = fs.readFileSync(path.join(__dirname, '..', 'db', 'seeds.sql'),  'utf8');
    console.log('[setup-db] aplicando schema.sql ...');
    await client.query(schema);
    console.log('[setup-db] aplicando seeds.sql ...');
    await client.query(seeds);
    console.log('✅ Banco configurado com sucesso.');
  } catch (err) {
    console.error('❌ Falha no setup do banco:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
