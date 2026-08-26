import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRuntimeConfig } from '../src/config/runtime.js';

test('production requires PostgreSQL persistence', () => {
  assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production', DISCORD_TOKEN: 'token' }), /DATABASE_URL wajib/);
});

test('runtime config parses safe production settings', () => {
  const config = loadRuntimeConfig({
    NODE_ENV: 'production',
    DISCORD_TOKEN: 'token',
    DATABASE_URL: 'postgresql://example',
    ADMIN_USER_IDS: '1, 2',
    MAINTENANCE_INTERVAL_MS: '60000',
    RATE_LIMIT_MAX: '20',
    RATE_LIMIT_WINDOW_MS: '30000',
  });
  assert.equal(config.maintenanceIntervalMs, 60_000);
  assert.equal(config.rateLimitMax, 20);
  assert.equal(config.rateLimitWindowMs, 30_000);
  assert.deepEqual([...config.adminUserIds], ['1', '2']);
});

test('runtime config rejects unsafe numeric values', () => {
  assert.throws(() => loadRuntimeConfig({ DISCORD_TOKEN: 'token', MAINTENANCE_INTERVAL_MS: '999' }), /MAINTENANCE_INTERVAL_MS/);
  assert.throws(() => loadRuntimeConfig({ DISCORD_TOKEN: 'token', RATE_LIMIT_MAX: '0' }), /RATE_LIMIT_MAX/);
  assert.throws(() => loadRuntimeConfig({ DISCORD_TOKEN: 'token', RATE_LIMIT_WINDOW_MS: 'abc' }), /RATE_LIMIT_WINDOW_MS/);
});
