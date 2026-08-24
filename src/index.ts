import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Pool } from 'pg';
import { handleCommand, handleComponent } from './discord/handlers.js';
import { UserCommandQueue } from './discord/command-queue.js';
import { UserRateLimiter } from './discord/rate-limit.js';
import { runMaintenance, runVersusMaintenance } from './jobs/maintenance.js';
import { createMaintenanceWorker } from './jobs/background-worker.js';
import { log } from './observability/logger.js';
import { JsonPlayerStore } from './storage/json-store.js';
import { PostgresPlayerStore } from './storage/postgres-store.js';
import type { PlayerStore } from './storage/json-store.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN belum diatur. Salin .env.example menjadi .env dan isi token bot.');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 }) : undefined;
const store: PlayerStore = pool ? new PostgresPlayerStore(pool) : new JsonPlayerStore(process.env.DATA_FILE ?? './data/players.json');
const rateLimiter = new UserRateLimiter(12, 60_000);
const commandQueue = new UserCommandQueue();
const maintenanceWorker = createMaintenanceWorker(async () => {
  const now = new Date();
  const profiles = await runMaintenance(store, now);
  const settledListings = await runVersusMaintenance(store, now);
  log('info', 'maintenance_completed', { profiles, settledListings });
});

client.once(Events.ClientReady, (readyClient) => {
  log('info', 'bot_ready', { user: readyClient.user.tag, persistence: pool ? 'postgresql' : 'json' });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.user?.bot) return;
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
  if (!rateLimiter.consume(interaction.user.id)) {
    if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'Terlalu banyak command dalam satu menit. Coba lagi sebentar.', ephemeral: true });
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
