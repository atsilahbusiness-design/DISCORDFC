import 'dotenv/config';
import { Pool } from 'pg';
import { JsonPlayerStore } from './json-store.js';
import { PostgresPlayerStore } from './postgres-store.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL belum diatur.');
const jsonPath = process.env.DATA_FILE ?? './data/players.json';
const source = new JsonPlayerStore(jsonPath);
const pool = new Pool({ connectionString: databaseUrl, max: 4 });
const target = new PostgresPlayerStore(pool);
try {
  const profiles = await source.all();
  for (const profile of profiles) await target.save(profile);
  console.log(`Imported ${profiles.length} profile(s) from ${jsonPath}.`);
} finally {
  await target.close();
}
