import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL belum diatur.');

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(here, 'schema.sql'), 'utf8');
const pool = new Pool({ connectionString: databaseUrl, max: 2 });
try {
  await pool.query(schema);
  console.log('Database schema siap.');
} finally {
  await pool.end();
}
