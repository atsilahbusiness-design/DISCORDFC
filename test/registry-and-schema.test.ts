import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { commandDefinitions } from '../src/discord/commands.js';

test('Discord registry exposes public Versus profile/bid and no technical matchmake command', () => {
  const names = commandDefinitions.map((command) => command.name);
  assert.equal(names.includes('versus-profile'), true);
  assert.equal(names.includes('versus-bid'), true);
  assert.equal(names.includes('versus-matchmake'), false);
  assert.equal(names.includes('versus-club'), false);
});

test('Postgres schema contains canonical Versus projection tables and economy columns', async () => {
  const schema = await readFile(new URL('../src/storage/schema.sql', import.meta.url), 'utf8');
  for (const table of ['versus_queue_tickets', 'versus_matches', 'versus_market_listings', 'versus_wallet_reservations']) assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  for (const column of ['mode', 'currency', 'season_id', 'battle_id', 'transaction_id']) assert.match(schema, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`));
});
