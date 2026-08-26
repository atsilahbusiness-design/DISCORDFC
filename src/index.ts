import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Pool } from 'pg';
import { handleCommand, handleComponent } from './discord/handlers.js';
import { UserCommandQueue } from './discord/command-queue.js';
import { UserRateLimiter } from './discord/rate-limit.js';
import { runMaintenance, runVersusMaintenance } from './jobs/maintenance.js';
import { createMaintenanceWorker } from './jobs/background-worker.js';
import { log } from './observability/logger.js';
import { loadRuntimeConfig } from './config/runtime.js';
import { JsonPlayerStore } from './storage/json-store.js';
import { PostgresPlayerStore } from './storage/postgres-store.js';
import type { MaintenanceLockStore, PlayerStore } from './storage/json-store.js';

const config = loadRuntimeConfig();
const token = config.discordToken;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const pool = config.databaseUrl ? new Pool({ connectionString: config.databaseUrl, max: 10, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000, application_name: 'football-rising-star-discord' }) : undefined;
const store: PlayerStore = pool ? new PostgresPlayerStore(pool) : new JsonPlayerStore(config.dataFile);
const rateLimiter = new UserRateLimiter(config.rateLimitMax, config.rateLimitWindowMs);
const mutationRateLimiter = new UserRateLimiter(Math.max(3, Math.floor(config.rateLimitMax / 2)), Math.min(config.rateLimitWindowMs, 10_000));
const mutationCommands = new Set(['versus-bid', 'versus-lineup', 'versus-round', 'versus-season', 'market', 'buy-player', 'train', 'next-week', 'play-match', 'daily-reward', 'claim-achievement', 'admin']);
const commandQueue = new UserCommandQueue();
const maintenanceWorker = createMaintenanceWorker(async () => {
  const run = async (): Promise<void> => {
    const now = new Date();
    const profiles = await runMaintenance(store, now);
    const settledListings = await runVersusMaintenance(store, now);
    log('info', 'maintenance_completed', { profiles, settledListings });
  };
  const lockStore = store as Partial<MaintenanceLockStore>;
  if (typeof lockStore.withMaintenanceLock === 'function') {
    await lockStore.withMaintenanceLock(run);
    return;
  }
  await run();
}, config.maintenanceIntervalMs);

client.once(Events.ClientReady, (readyClient) => {
  log('info', 'bot_ready', { user: readyClient.user.tag, persistence: pool ? 'postgresql' : 'json', environment: config.nodeEnv, maintenanceIntervalMs: config.maintenanceIntervalMs });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.user?.bot) return;
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
  const scope = interaction.isChatInputCommand() ? interaction.commandName : interaction.customId.split(':', 1)[0];
  if (!rateLimiter.consume(interaction.user.id, Date.now(), 'global') || (interaction.isChatInputCommand() && mutationCommands.has(interaction.commandName) && !mutationRateLimiter.consume(interaction.user.id, Date.now(), 'mutation'))) {
    log('warn', 'interaction_rate_limited', { userId: interaction.user.id, scope });
    if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'Terlalu banyak aksi dalam waktu singkat. Coba lagi sebentar.', ephemeral: true });
    return;
  }
  if (interaction.isChatInputCommand()) {
    await commandQueue.run(interaction.user.id, () => handleCommand(interaction, store));
  } else {
    await commandQueue.run(interaction.user.id, () => handleComponent(interaction, store));
  }
});

client.on(Events.Error, (error) => log('error', 'discord_client_error', { error }));

const shutdown = async (signal: string): Promise<void> => {
  log('info', 'shutdown_requested', { signal });
  maintenanceWorker.stop();
  client.destroy();
  if (pool) await pool.end();
  process.exit(0);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => log('error', 'unhandled_rejection', { reason }));
process.on('uncaughtException', (error) => {
  log('error', 'uncaught_exception', { error });
  void shutdown('uncaughtException');
});

await client.login(token);
maintenanceWorker.start();
