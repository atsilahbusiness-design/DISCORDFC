import { Pool } from 'pg';
import type { PlayerProfile } from '../domain/types.js';
import type { PlayerStore } from './json-store.js';

export class PostgresPlayerStore implements PlayerStore {
  constructor(private readonly pool: Pool) {}

  async get(userId: string): Promise<PlayerProfile | undefined> {
    const result = await this.pool.query<{ payload: PlayerProfile; version: number }>('SELECT payload, version FROM player_profiles WHERE user_id = $1', [userId]);
    const row = result.rows[0];
    if (!row?.payload) return undefined;
    const profile = structuredClone(row.payload);
    profile.version = row.version ?? profile.version ?? 0;
    return profile;
  }

  async save(profile: PlayerProfile): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const expectedVersion = profile.version ?? 0;
      const result = await client.query<{ version: number }>(
        `INSERT INTO player_profiles (user_id, payload, updated_at, version)
         VALUES ($1, $2::jsonb, $3::timestamptz, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at, version = player_profiles.version + 1
         WHERE player_profiles.version = $4
         RETURNING version`,
        [profile.userId, JSON.stringify(profile), profile.updatedAt, expectedVersion]
      );
      if (result.rowCount !== 1) throw new Error('Concurrent profile update detected. Silakan ulangi command.');
      profile.version = result.rows[0].version;
      await client.query('DELETE FROM economy_ledger WHERE user_id = $1', [profile.userId]);
      if (profile.ledger?.length) {
        await client.query(
          `INSERT INTO economy_ledger (id, user_id, created_at, entry_type, amount, balance_after, note)
           SELECT x.id, $1, x.created_at::timestamptz, x.entry_type, x.amount, x.balance_after, x.note
           FROM jsonb_to_recordset($2::jsonb) AS x(id text, created_at text, entry_type text, amount bigint, balance_after bigint, note text)
           ON CONFLICT (id) DO NOTHING`,
          [profile.userId, JSON.stringify(profile.ledger)]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async all(): Promise<PlayerProfile[]> {
    const result = await this.pool.query<{ payload: PlayerProfile; version: number }>('SELECT payload, version FROM player_profiles ORDER BY updated_at DESC');
    return result.rows.map((row) => {
      const profile = structuredClone(row.payload);
      profile.version = row.version ?? profile.version ?? 0;
      return profile;
    });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
