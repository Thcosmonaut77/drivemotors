const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'drivemotors',
  user: process.env.DB_USER || 'drivex',
  password: process.env.DB_PASSWORD || 'drivex_secret_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
