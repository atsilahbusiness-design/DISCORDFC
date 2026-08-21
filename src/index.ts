import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Pool } from 'pg';
import { handleCommand } from './discord/handlers.js';
import { UserRateLimiter } from './discord/rate-limit.js';
import { runMaintenance } from './jobs/maintenance.js';
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
const maintenanceTimer = setInterval(() => void runMaintenance(store).then((count) => log('info', 'maintenance_completed', { profiles: count })).catch((error) => log('error', 'maintenance_failed', { error })), 15 * 60_000);

client.once(Events.ClientReady, (readyClient) => {
  log('info', 'bot_ready', { user: readyClient.user.tag, persistence: pool ? 'postgresql' : 'json' });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.user.bot) return;
  if (!rateLimiter.consume(interaction.user.id)) {
    await interaction.reply({ content: 'Terlalu banyak command dalam satu menit. Coba lagi sebentar.', ephemeral: true });
    return;
  }
  await handleCommand(interaction, store);
});

const shutdown = async (signal: string): Promise<void> => {
  log('info', 'shutdown_requested', { signal });
  clearInterval(maintenanceTimer);
  client.destroy();
  if (pool) await pool.end();
  process.exit(0);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

await client.login(token);
