import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { PlayerProfile } from '../domain/types.js';

export interface PlayerStore {
  get(userId: string): Promise<PlayerProfile | undefined>;
  save(profile: PlayerProfile): Promise<void>;
  all(): Promise<PlayerProfile[]>;
}

export interface BatchPlayerStore extends PlayerStore {
  saveBatch(profiles: PlayerProfile[]): Promise<void>;
}

export interface VersusGroupLockStore extends PlayerStore {
  withVersusGroupLock<T>(groupCode: string, operation: () => Promise<T>): Promise<T>;
}

export interface MaintenanceLockStore extends PlayerStore {
  withMaintenanceLock<T>(operation: () => Promise<T>): Promise<T | undefined>;
}

interface StoreFile {
  players: Record<string, PlayerProfile>;
}

export class JsonPlayerStore implements BatchPlayerStore, VersusGroupLockStore, MaintenanceLockStore {
  private cache?: StoreFile;
  private writeTail: Promise<void> = Promise.resolve();
  private readonly groupQueues = new Map<string, Promise<void>>();
  private maintenanceLock: Promise<void> = Promise.resolve();

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
    await this.saveBatch([profile]);
  }

  async saveBatch(profiles: PlayerProfile[]): Promise<void> {
    if (profiles.length === 0) return;
    const next = this.writeTail.catch(() => undefined).then(async () => {
      const store = await this.load();
      const seen = new Set<string>();
      for (const profile of profiles) {
        if (seen.has(profile.userId)) throw new Error(`Duplicate profile in batch: ${profile.userId}`);
        seen.add(profile.userId);
        profile.version = (profile.version ?? 0) + 1;
        store.players[profile.userId] = structuredClone(profile);
      }
      await mkdir(dirname(this.path), { recursive: true });
      const tempPath = `${this.path}.tmp`;
      await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
      await rename(tempPath, this.path);
    });
    this.writeTail = next;
    await next;
  }

  async withMaintenanceLock<T>(operation: () => Promise<T>): Promise<T | undefined> {
    const previous = this.maintenanceLock;
    let release!: () => void;
    this.maintenanceLock = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  }

  async withVersusGroupLock<T>(groupCode: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.groupQueues.get(groupCode) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
    const queued = previous.then(() => current);
    this.groupQueues.set(groupCode, queued);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.groupQueues.get(groupCode) === queued) this.groupQueues.delete(groupCode);
    }
  }

  async all(): Promise<PlayerProfile[]> {
    const store = await this.load();
    return Object.values(store.players).map((profile) => { profile.version ??= 0; return structuredClone(profile); });
  }
}
