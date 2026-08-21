import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { PlayerProfile } from '../domain/types.js';

export interface PlayerStore {
  get(userId: string): Promise<PlayerProfile | undefined>;
  save(profile: PlayerProfile): Promise<void>;
  all(): Promise<PlayerProfile[]>;
}

interface StoreFile {
  players: Record<string, PlayerProfile>;
}

export class JsonPlayerStore implements PlayerStore {
  private cache?: StoreFile;
  private writeTail: Promise<void> = Promise.resolve();

  constructor(private readonly path: string) {}

  private async load(): Promise<StoreFile> {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.path, 'utf8');
      const parsed = JSON.parse(raw) as StoreFile;
      this.cache = parsed.players ? parsed : { players: {} };
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? (error as NodeJS.ErrnoException).code : undefined;
      if (code !== 'ENOENT') throw error;
      this.cache = { players: {} };
    }
    return this.cache;
  }

  async get(userId: string): Promise<PlayerProfile | undefined> {
    const store = await this.load();
    const profile = store.players[userId];
    if (!profile) return undefined;
    profile.version ??= 0;
    return structuredClone(profile);
  }

  async save(profile: PlayerProfile): Promise<void> {
    const next = this.writeTail.catch(() => undefined).then(async () => {
      const store = await this.load();
      profile.version = (profile.version ?? 0) + 1;
      store.players[profile.userId] = structuredClone(profile);
      await mkdir(dirname(this.path), { recursive: true });
      const tempPath = `${this.path}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
      await rename(tempPath, this.path);
    });
    this.writeTail = next;
    await next;
  }

  async all(): Promise<PlayerProfile[]> {
    const store = await this.load();
    return Object.values(store.players).map((profile) => { profile.version ??= 0; return structuredClone(profile); });
  }
}
