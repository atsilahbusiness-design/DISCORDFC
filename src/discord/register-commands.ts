import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandDefinitions } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error('DISCORD_TOKEN dan DISCORD_CLIENT_ID wajib diatur.');
}

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
await rest.put(route, { body: commandDefinitions });
console.log(guildId ? `Registered ${commandDefinitions.length} command(s) untuk guild ${guildId}.` : `Registered ${commandDefinitions.length} global command(s).`);
