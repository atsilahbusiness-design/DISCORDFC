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
  new SlashCommandBuilder().setName('match').setDescription('Simulasikan pertandingan karier pemain'),
  new SlashCommandBuilder().setName('league').setDescription('Lihat progres musim dan klasemen pribadi'),
  new SlashCommandBuilder().setName('club').setDescription('Lihat kondisi klub, rating, formasi, dan taktik'),
  new SlashCommandBuilder().setName('squad').setDescription('Lihat roster klub dan kemampuan pemain'),
  new SlashCommandBuilder()
    .setName('formation')
    .setDescription('Ubah formasi klub')
    .addStringOption((option) => option.setName('id').setDescription('Formasi').setRequired(true).addChoices(
      { name: '4-4-2 Balanced', value: '4-4-2' },
      { name: '4-3-3 Attacking', value: '4-3-3' },
      { name: '3-5-2 Control', value: '3-5-2' },
      { name: '5-3-2 Defensive', value: '5-3-2' }
    )),
  new SlashCommandBuilder()
    .setName('tactic')
    .setDescription('Ubah taktik klub')
    .addStringOption((option) => option.setName('id').setDescription('Taktik').setRequired(true).addChoices(
      { name: 'Balanced', value: 'balanced' },
      { name: 'Attacking', value: 'attacking' },
      { name: 'Defensive', value: 'defensive' },
      { name: 'Counter Attack', value: 'counter' }
    )),
  new SlashCommandBuilder().setName('club-match').setDescription('Mainkan fixture klub berikutnya'),
  new SlashCommandBuilder().setName('standings').setDescription('Lihat klasemen liga klub'),
  new SlashCommandBuilder().setName('season-end').setDescription('Tutup musim jika seluruh fixture sudah dimainkan'),
  new SlashCommandBuilder().setName('daily').setDescription('Ambil daily reward dan streak'),
  new SlashCommandBuilder().setName('event').setDescription('Lihat event harian dan pilihan yang tersedia').addStringOption((option) => option.setName('choice').setDescription('ID pilihan event, kosongkan untuk melihat event').setRequired(false)),
  new SlashCommandBuilder().setName('market').setDescription('Lihat atau refresh transfer market').addStringOption((option) => option.setName('action').setDescription('Aksi market').setRequired(false).addChoices({ name: 'List', value: 'list' }, { name: 'Refresh', value: 'refresh' })),
  new SlashCommandBuilder().setName('buy-player').setDescription('Beli pemain dari market').addStringOption((option) => option.setName('listing').setDescription('ID listing, gunakan /market terlebih dahulu').setRequired(true)),
  new SlashCommandBuilder().setName('sell-player').setDescription('Jual pemain klub').addStringOption((option) => option.setName('player').setDescription('ID pemain, gunakan /squad terlebih dahulu').setRequired(true)),
  new SlashCommandBuilder().setName('champions').setDescription('Lihat atau mainkan Champions League').addStringOption((option) => option.setName('action').setDescription('Aksi').setRequired(false).addChoices({ name: 'Status', value: 'status' }, { name: 'Play', value: 'play' })),
  new SlashCommandBuilder().setName('achievements').setDescription('Lihat achievement dan progress'),
  new SlashCommandBuilder().setName('claim-achievement').setDescription('Klaim achievement yang sudah selesai').addStringOption((option) => option.setName('achievement').setDescription('ID achievement').setRequired(true)),
  new SlashCommandBuilder().setName('admin').setDescription('Admin maintenance command').addStringOption((option) => option.setName('action').setDescription('Aksi admin').setRequired(true).addChoices({ name: 'Stats', value: 'stats' }, { name: 'Refresh all markets', value: 'refresh-markets' })),
  new SlashCommandBuilder().setName('help').setDescription('Lihat panduan command bot')
].map((command) => command.toJSON());
