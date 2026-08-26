import { REST, Routes } from 'discord.js';
import { commandDefinitions } from './commands.js';
import { loadRuntimeConfig } from '../config/runtime.js';

const config = loadRuntimeConfig();
const clientId = config.discordClientId;
if (!clientId) throw new Error('DISCORD_CLIENT_ID wajib diatur untuk command registration.');

const rest = new REST({ version: '10' }).setToken(config.discordToken);
const route = config.discordGuildId ? Routes.applicationGuildCommands(clientId, config.discordGuildId) : Routes.applicationCommands(clientId);
await rest.put(route, { body: commandDefinitions });
console.log(config.discordGuildId ? `Registered ${commandDefinitions.length} command(s) untuk guild ${config.discordGuildId}.` : `Registered ${commandDefinitions.length} global command(s).`);
