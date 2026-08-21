import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { handleCommand } from './discord/handlers.js';
import { JsonPlayerStore } from './storage/json-store.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN belum diatur. Salin .env.example menjadi .env dan isi token bot.');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const store = new JsonPlayerStore(process.env.DATA_FILE ?? './data/players.json');

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot online sebagai ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleCommand(interaction, store);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`Menerima ${signal}; mematikan bot dengan aman.`);
  client.destroy();
  process.exit(0);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

await client.login(token);
