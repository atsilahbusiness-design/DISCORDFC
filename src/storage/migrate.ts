import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL belum diatur.');

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(here, 'schema.sql'), 'utf8');
const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 10_000, application_name: 'football-rising-star-migration' });
const client = await pool.connect();
try {
  await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', ['football-rising-star-schema']);
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '10s'");
  await client.query("SET LOCAL statement_timeout = '60s'");
  await client.query(schema);
  await client.query('COMMIT');
  console.log('Database schema siap.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  throw error;
} finally {
  await client.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', ['football-rising-star-schema']).catch(() => undefined);
  client.release();
  await pool.end();
}
