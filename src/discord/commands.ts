import { SlashCommandBuilder } from 'discord.js';

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('Buat profil karier Football Rising Star')
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription('Posisi awal pemain')
        .setRequired(true)
        .addChoices(
          { name: 'Goalkeeper', value: 'GK' },
          { name: 'Defender', value: 'DF' },
          { name: 'Midfielder', value: 'MF' },
          { name: 'Forward', value: 'FW' }
        )
    ),
  new SlashCommandBuilder().setName('profile').setDescription('Lihat profil, ability, HP, energi, dan statistik'),
  new SlashCommandBuilder()
    .setName('train')
    .setDescription('Latih satu ability pemain')
    .addStringOption((option) =>
      option
        .setName('ability')
        .setDescription('Ability yang ingin dilatih')
        .setRequired(true)
        .addChoices(
          { name: 'Attack', value: 'atk' },
          { name: 'Defence', value: 'def' },
          { name: 'Speed', value: 'speed' },
          { name: 'Power', value: 'power' },
          { name: 'Strength', value: 'strength' },
          { name: 'Technique', value: 'technique' }
        )
    ),
  new SlashCommandBuilder().setName('match').setDescription('Simulasikan pertandingan berikutnya'),
  new SlashCommandBuilder().setName('league').setDescription('Lihat progres musim dan klasemen pribadi'),
  new SlashCommandBuilder().setName('help').setDescription('Lihat panduan singkat command bot')
].map((command) => command.toJSON());
