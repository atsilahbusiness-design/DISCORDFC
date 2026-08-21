import { Pool } from 'pg';
import type { PlayerProfile } from '../domain/types.js';
import type { PlayerStore } from './json-store.js';

export class PostgresPlayerStore implements PlayerStore {
  constructor(private readonly pool: Pool) {}

  async get(userId: string): Promise<PlayerProfile | undefined> {
    const result = await this.pool.query<{ payload: PlayerProfile }>('SELECT payload FROM player_profiles WHERE user_id = $1', [userId]);
    return result.rows[0]?.payload ? structuredClone(result.rows[0].payload) : undefined;
  }

  async save(profile: PlayerProfile): Promise<void> {
    await this.pool.query(
      `INSERT INTO player_profiles (user_id, payload, updated_at)
       VALUES ($1, $2::jsonb, $3::timestamptz)
       ON CONFLICT (user_id) DO UPDATE
       SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at`,
      [profile.userId, JSON.stringify(profile), profile.updatedAt]
    );
    if (profile.ledger?.length) {
      await this.pool.query('DELETE FROM economy_ledger WHERE user_id = $1', [profile.userId]);
      await this.pool.query(
        `INSERT INTO economy_ledger (id, user_id, created_at, entry_type, amount, balance_after, note)
         SELECT x.id, $1, x.created_at::timestamptz, x.entry_type, x.amount, x.balance_after, x.note
         FROM jsonb_to_recordset($2::jsonb) AS x(id text, created_at text, entry_type text, amount bigint, balance_after bigint, note text)
         ON CONFLICT (id) DO NOTHING`,
        [profile.userId, JSON.stringify(profile.ledger)]
      );
    }
  }

  async all(): Promise<PlayerProfile[]> {
    const result = await this.pool.query<{ payload: PlayerProfile }>('SELECT payload FROM player_profiles ORDER BY updated_at DESC');
    return result.rows.map((row) => structuredClone(row.payload));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
