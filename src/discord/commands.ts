import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

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
  new SlashCommandBuilder().setName('skills').setDescription('Lihat detailed skills, EXP pending, injury, trainer, culture, tricks, dan honors'),
  new SlashCommandBuilder()
    .setName('train-skill')
    .setDescription('Latih satu detailed skill')
    .addStringOption((option) => option.setName('skill').setDescription('Detailed skill').setRequired(true).addChoices(
      { name: 'Shots', value: 'shots' },
      { name: 'Penalty', value: 'penalty' },
      { name: 'Header', value: 'header' },
      { name: 'Pass', value: 'pass' },
      { name: 'Dribbling', value: 'dribbling' },
      { name: 'Free Kick', value: 'freeKick' },
      { name: 'Off-ball Running', value: 'offBallRunning' },
      { name: 'Hold Off Defenders', value: 'holdOffDefenders' },
      { name: 'Teamwork', value: 'teamwork' },
      { name: 'Endurance', value: 'endurance' },
      { name: 'Speed', value: 'speed' },
      { name: 'Willpower', value: 'willpower' }
    )),
  new SlashCommandBuilder()
    .setName('assign-exp')
    .setDescription('Alokasikan EXP pertandingan secara manual')
    .addStringOption((option) => option.setName('skill').setDescription('Skill tujuan').setRequired(true).addChoices(
      { name: 'Shots', value: 'shots' }, { name: 'Penalty', value: 'penalty' }, { name: 'Header', value: 'header' }, { name: 'Pass', value: 'pass' }, { name: 'Dribbling', value: 'dribbling' }, { name: 'Free Kick', value: 'freeKick' }, { name: 'Off-ball Running', value: 'offBallRunning' }, { name: 'Hold Off Defenders', value: 'holdOffDefenders' }, { name: 'Teamwork', value: 'teamwork' }, { name: 'Endurance', value: 'endurance' }, { name: 'Speed', value: 'speed' }, { name: 'Willpower', value: 'willpower' }
    ))
    .addIntegerOption((option) => option.setName('amount').setDescription('Jumlah EXP').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('next-week').setDescription('Majukan satu minggu karier dan simulasikan loop mingguan'),
  new SlashCommandBuilder().setName('injury').setDescription('Lihat atau tangani cedera').addStringOption((option) => option.setName('action').setDescription('Aksi cedera').setRequired(false).addChoices({ name: 'View', value: 'view' }, { name: 'Basic treatment', value: 'basic-treatment' }, { name: 'Expert treatment', value: 'expert-treatment' })),
  new SlashCommandBuilder().setName('trick').setDescription('Lihat atau unlock trick training').addStringOption((option) => option.setName('action').setDescription('Aksi trick').setRequired(false).addChoices({ name: 'List', value: 'list' }, { name: 'Train', value: 'train' })).addStringOption((option) => option.setName('trick_id').setDescription('ID trick, contoh bicycle-kick').setRequired(false)),
  new SlashCommandBuilder().setName('trainer').setDescription('Lihat atau kelola personal trainer').addStringOption((option) => option.setName('action').setDescription('Aksi trainer').setRequired(false).addChoices({ name: 'List', value: 'list' }, { name: 'Hire', value: 'hire' }, { name: 'Release', value: 'release' })).addStringOption((option) => option.setName('trainer_id').setDescription('ID trainer').setRequired(false)),
  new SlashCommandBuilder().setName('culture').setDescription('Mulai culture study').addStringOption((option) => option.setName('subject').setDescription('Subject').setRequired(true).addChoices({ name: 'Science', value: 'science' }, { name: 'Arts', value: 'arts' }, { name: 'History', value: 'history' })),
  new SlashCommandBuilder().setName('honors').setDescription('Lihat Hall of Honor personal, team, dan national'),
  new SlashCommandBuilder().setName('world-footballer').setDescription('Lihat hasil World Footballer tahunan'),
  new SlashCommandBuilder().setName('retire').setDescription('Pensiun setelah mencapai batas karier'),
  new SlashCommandBuilder().setName('rebirth').setDescription('Mulai ulang karier setelah retirement'),
  new SlashCommandBuilder().setName('match').setDescription('Simulasikan pertandingan karier'),
  new SlashCommandBuilder().setName('league').setDescription('Lihat progres musim dan klasemen pribadi'),
  new SlashCommandBuilder().setName('club').setDescription('Lihat kondisi klub, rating, formasi, dan taktik'),
  new SlashCommandBuilder().setName('clubs').setDescription('Lihat official clubs dari client data').addIntegerOption((option) => option.setName('league').setDescription('League code, contoh 1011').setRequired(false)),
  new SlashCommandBuilder().setName('join-club').setDescription('Pindah ke official club').addIntegerOption((option) => option.setName('club_id').setDescription('Official club ID dari /clubs').setRequired(true).setMinValue(100000).setMaxValue(999999)),
  new SlashCommandBuilder().setName('squad').setDescription('Lihat roster klub dan kemampuan pemain'),
  new SlashCommandBuilder()
    .setName('formation')
    .setDescription('Ubah formasi klub')
    .addStringOption((option) => option.setName('id').setDescription('Formasi').setRequired(true).addChoices(
      { name: '4-4-2 Balanced', value: '4-4-2' },
      { name: '4-3-3 Attacking', value: '4-3-3' },
      { name: '3-5-2 Control', value: '3-5-2' },
      { name: '5-3-2 Defensive', value: '5-3-2' },
      { name: '4-1-3-2 Flexible', value: '4-1-3-2' },
      { name: '3-4-3 Aggressive', value: '3-4-3' },
      { name: '4-2-3-1 Possession', value: '4-2-3-1' }
    ))
    .addStringOption((option) => option.setName('mode').setDescription('Mode club yang diubah').setRequired(false).addChoices({ name: 'Player Club', value: 'PLAYER' }, { name: 'Coach Club', value: 'COACH' })),
  new SlashCommandBuilder()
    .setName('tactic')
    .setDescription('Ubah taktik klub')
    .addStringOption((option) => option.setName('id').setDescription('Taktik').setRequired(true).addChoices(
      { name: 'Balanced', value: 'balanced' },
      { name: 'Attacking', value: 'attacking' },
      { name: 'Defensive', value: 'defensive' },
      { name: 'Counter Attack', value: 'counter' },
      { name: 'Down the Wings', value: 'down-wings' },
      { name: 'Middle Thrust', value: 'middle-thrust' },
      { name: 'Tiki-Taka', value: 'tiki-taka' },
      { name: 'Long Ball', value: 'long-ball' },
      { name: 'Offense Full', value: 'offense-full' },
      { name: 'Defense Full', value: 'defense-full' }
    ))
    .addStringOption((option) => option.setName('mode').setDescription('Mode club yang diubah').setRequired(false).addChoices({ name: 'Player Club', value: 'PLAYER' }, { name: 'Coach Club', value: 'COACH' })),
  new SlashCommandBuilder().setName('club-match').setDescription('Mainkan fixture klub berikutnya'),
  new SlashCommandBuilder().setName('coach-career').setDescription('Mulai atau lihat karier Coach').addStringOption((option) => option.setName('action').setDescription('Aksi karier Coach').setRequired(false).addChoices({ name: 'Start', value: 'start' }, { name: 'Status', value: 'status' })),
  new SlashCommandBuilder().setName('coach-profile').setDescription('Lihat profil Coach, abilities, approval, dan board target'),
  new SlashCommandBuilder().setName('coach-event').setDescription('Lihat atau selesaikan Coach event').addStringOption((option) => option.setName('choice').setDescription('ID pilihan event, kosongkan untuk melihat').setRequired(false)),
  new SlashCommandBuilder().setName('coach-round').setDescription('Mainkan round Coach berikutnya dengan simulasi dua babak'),
  new SlashCommandBuilder().setName('coach-exp').setDescription('Alokasikan Coach EXP secara manual').addStringOption((option) => option.setName('ability').setDescription('Coach ability tujuan').setRequired(true).addChoices({ name: 'Formation Understanding', value: 'formation' }, { name: 'Tactical Thinking', value: 'tactics' }, { name: 'State Adjustment', value: 'stateAdjustment' }, { name: 'Training Level', value: 'trainingLevel' }, { name: 'Locker Room Prestige', value: 'lockerRoom' }, { name: 'Personal Charisma', value: 'charisma' })).addIntegerOption((option) => option.setName('amount').setDescription('Jumlah EXP').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('coach-job').setDescription('Lihat atau kelola job offer Coach').addStringOption((option) => option.setName('action').setDescription('Aksi job').setRequired(false).addChoices({ name: 'Generate offer', value: 'generate' }, { name: 'List offers', value: 'list' }, { name: 'Accept offer', value: 'accept' }, { name: 'Decline offer', value: 'decline' })).addStringOption((option) => option.setName('offer_id').setDescription('ID offer dari list').setRequired(false)),
  new SlashCommandBuilder().setName('coach-retire').setDescription('Pensiun dari karier Coach'),
  new SlashCommandBuilder().setName('coach-rebirth').setDescription('Mulai ulang karier Coach setelah retirement'),
  new SlashCommandBuilder().setName('versus-matchmake').setDescription('Cari dan tetapkan pertandingan Versus melalui system matchmaking'),
  new SlashCommandBuilder().setName('versus-join').setDescription('Bergabung ke private Versus group dengan group code (fallback)').addStringOption((option) => option.setName('group_code').setDescription('Kode private group Versus').setRequired(true)),
  new SlashCommandBuilder().setName('versus-profile').setDescription('Lihat assigned team, matchmaking, wallet, roster condition, dan season Versus'),
  new SlashCommandBuilder().setName('versus-roster').setDescription('Lihat roster assigned team, eligibility, battle aktif, dan deadline Versus'),
  new SlashCommandBuilder().setName('versus-lineup').setDescription('Submit lineup dan taktik untuk battle Versus').addStringOption((option) => option.setName('battle_id').setDescription('Battle ID dari round berikutnya').setRequired(true)).addStringOption((option) => option.setName('lineup').setDescription('11 player ID dipisahkan koma').setRequired(true)).addStringOption((option) => option.setName('substitutes').setDescription('Maksimal 5 player ID dipisahkan koma').setRequired(false)).addStringOption((option) => option.setName('captain').setDescription('Player ID captain dari starting XI').setRequired(true)).addStringOption((option) => option.setName('formation').setDescription('Formasi battle').setRequired(true).addChoices({ name: '4-4-2', value: '4-4-2' }, { name: '4-3-3', value: '4-3-3' }, { name: '3-5-2', value: '3-5-2' }, { name: '5-3-2', value: '5-3-2' }, { name: '4-1-3-2', value: '4-1-3-2' }, { name: '3-4-3', value: '3-4-3' }, { name: '4-2-3-1', value: '4-2-3-1' })).addStringOption((option) => option.setName('tactic').setDescription('Taktik battle').setRequired(true).addChoices({ name: 'Balanced', value: 'balanced' }, { name: 'Attacking', value: 'attacking' }, { name: 'Defensive', value: 'defensive' }, { name: 'Counter Attack', value: 'counter' }, { name: 'Down the Wings', value: 'down-wings' }, { name: 'Middle Thrust', value: 'middle-thrust' }, { name: 'Tiki-Taka', value: 'tiki-taka' }, { name: 'Long Ball', value: 'long-ball' }, { name: 'Offense Full', value: 'offense-full' }, { name: 'Defense Full', value: 'defense-full' })).addIntegerOption((option) => option.setName('roster_version').setDescription('Roster version saat /versus-profile').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('versus-standings').setDescription('Lihat klasemen group/league Versus'),
  new SlashCommandBuilder().setName('versus-round').setDescription('Proses round Versus berikutnya secara asynchronous'),
  new SlashCommandBuilder().setName('versus-season').setDescription('Lihat atau tutup season Versus').addStringOption((option) => option.setName('action').setDescription('Aksi season').setRequired(false).addChoices({ name: 'Status', value: 'status' }, { name: 'Settle', value: 'settle' })),
  new SlashCommandBuilder().setName('standings').setDescription('Lihat klasemen liga klub'),
  new SlashCommandBuilder().setName('season-end').setDescription('Tutup musim jika seluruh fixture sudah dimainkan'),
  new SlashCommandBuilder().setName('daily').setDescription('Ambil daily reward dan streak'),
  new SlashCommandBuilder().setName('event').setDescription('Lihat event harian dan pilihan yang tersedia').addStringOption((option) => option.setName('choice').setDescription('ID pilihan event, kosongkan untuk melihat event').setRequired(false)),
  new SlashCommandBuilder().setName('market').setDescription('Lihat atau refresh transfer market').addStringOption((option) => option.setName('action').setDescription('Aksi market').setRequired(false).addChoices({ name: 'List', value: 'list' }, { name: 'Refresh', value: 'refresh' })),
  new SlashCommandBuilder().setName('buy-player').setDescription('Beli pemain dari market').addStringOption((option) => option.setName('listing').setDescription('ID listing, gunakan /market terlebih dahulu').setRequired(true)),
  new SlashCommandBuilder().setName('sell-player').setDescription('Jual pemain klub').addStringOption((option) => option.setName('player').setDescription('ID pemain, gunakan /squad terlebih dahulu').setRequired(true)),
  new SlashCommandBuilder().setName('contract').setDescription('Lihat atau perbarui kontrak pemain').addStringOption((option) => option.setName('action').setDescription('Aksi kontrak').setRequired(false).addChoices({ name: 'View', value: 'view' }, { name: 'Sign or renew', value: 'sign' })),
  new SlashCommandBuilder().setName('champions').setDescription('Lihat atau mainkan Champions League Player atau Coach').addStringOption((option) => option.setName('action').setDescription('Aksi').setRequired(false).addChoices({ name: 'Status', value: 'status' }, { name: 'Play', value: 'play' })).addStringOption((option) => option.setName('mode').setDescription('Aggregate competition yang digunakan').setRequired(false).addChoices({ name: 'Player Mode', value: 'PLAYER' }, { name: 'Coach Mode', value: 'COACH' })),
  new SlashCommandBuilder().setName('achievements').setDescription('Lihat achievement dan progress'),
  new SlashCommandBuilder().setName('claim-achievement').setDescription('Klaim achievement yang sudah selesai').addStringOption((option) => option.setName('achievement').setDescription('ID achievement').setRequired(true)),
  new SlashCommandBuilder().setName('admin').setDescription('Admin maintenance command').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString()).addStringOption((option) => option.setName('action').setDescription('Aksi admin').setRequired(true).addChoices({ name: 'Stats', value: 'stats' }, { name: 'Refresh all markets', value: 'refresh-markets' })),
  new SlashCommandBuilder().setName('help').setDescription('Lihat panduan command bot')
].map((command) => command.toJSON());
