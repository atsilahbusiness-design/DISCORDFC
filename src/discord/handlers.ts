import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  type ColorResolvable
} from 'discord.js';
import {
  createInitialProfile,
  formatAbility,
  getRating,
  playMatch,
  recoverPlayer,
  trainPlayer
} from '../domain/engine.js';
import { ABILITY_LABELS, POSITION_LABELS, type AbilityId, type PlayerProfile, type Position } from '../domain/types.js';
import type { PlayerStore } from '../storage/json-store.js';

const BRAND_COLOR: ColorResolvable = '#1f8b4c';

function profileEmbed(profile: PlayerProfile): EmbedBuilder {
  const abilities = Object.entries(profile.abilities)
    .map(([id, state]) => `${ABILITY_LABELS[id as AbilityId]}: **${profile.stats[id as AbilityId]}** (Lv ${state.level}, ${state.exp} EXP)`)
    .join('\n');
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(`${profile.displayName} — Football Rising Star`)
    .setDescription(`**${POSITION_LABELS[profile.position]}** · ${profile.club} · Rating **${getRating(profile)}**`)
    .addFields(
      { name: 'Condition', value: `HP **${profile.hp}/${profile.maxHp}**\nEnergy **${profile.energy}/${profile.maxEnergy}**\nMoney **${profile.money}**`, inline: true },
      { name: 'Career', value: `Level **${profile.level}**\nEXP **${profile.totalExp}**\nAge **${profile.age}**`, inline: true },
      { name: 'Abilities', value: abilities || 'Belum ada ability.' },
      { name: 'Career statistics', value: `Appearances **${profile.career.appearances}** · W-D-L **${profile.career.wins}-${profile.career.draws}-${profile.career.losses}**\nGoals **${profile.career.goals}** · Assists **${profile.career.assists}** · Clean sheets **${profile.career.cleanSheets}**` }
    )
    .setFooter({ text: 'MVP porting Football Rising Star · Formula pertandingan dapat dikalibrasi dengan backend resmi.' });
}

async function requireProfile(interaction: ChatInputCommandInteraction, store: PlayerStore): Promise<PlayerProfile | undefined> {
  const profile = await store.get(interaction.user.id);
  if (!profile) {
    await interaction.reply({ content: 'Profil belum dibuat. Jalankan `/start position:<GK|DF|MF|FW>` terlebih dahulu.', ephemeral: true });
    return undefined;
  }
  return profile;
}

export async function handleCommand(interaction: ChatInputCommandInteraction, store: PlayerStore): Promise<void> {
  const command = interaction.commandName;
  try {
    if (command === 'start') {
      const existing = await store.get(interaction.user.id);
      if (existing) {
        await interaction.reply({ content: 'Profil Anda sudah ada. Gunakan `/profile` untuk melihatnya.', ephemeral: true });
        return;
      }
      const position = interaction.options.getString('position', true) as Position;
      const profile = createInitialProfile(interaction.user.id, interaction.user.globalName ?? interaction.user.username, position);
      await store.save(profile);
      await interaction.reply({ embeds: [profileEmbed(profile)] });
      return;
    }

    if (command === 'profile') {
      const profile = await requireProfile(interaction, store);
      if (profile) await interaction.reply({ embeds: [profileEmbed(recoverPlayer(profile))] });
      return;
    }

    if (command === 'train') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const ability = interaction.options.getString('ability', true) as AbilityId;
      const result = trainPlayer(profile, ability);
      await store.save(result.profile);
      const levelText = result.levelUp ? '\n**Level ability naik.**' : '';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Training selesai').setDescription(`**${formatAbility(result.ability)}** bertambah dari **${result.statBefore}** menjadi **${result.statAfter}**. EXP diperoleh: **${result.expGained}**.${levelText}`).addFields({ name: 'Sisa energi', value: `${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }, { name: 'Total rating', value: `${getRating(result.profile)}`, inline: true })] });
      return;
    }

    if (command === 'match') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = playMatch(profile);
      await store.save(result.profile);
      const outcomeLabel = result.record.outcome === 'WIN' ? 'VICTORY' : result.record.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${outcomeLabel} · ${result.profile.club} ${result.record.playerGoals}–${result.record.opponentGoals} ${result.record.opponent}`).setDescription(result.narrative.join('\n')).addFields({ name: 'Player score', value: `${result.record.playerScore}`, inline: true }, { name: 'Rewards', value: `${result.record.rewards.money} money\n${result.record.rewards.exp} EXP`, inline: true }, { name: 'Condition', value: `HP ${result.profile.hp}/${result.profile.maxHp}\nEnergy ${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }).setFooter({ text: `Season ${result.profile.league.season} · Matchday ${result.profile.league.matchday}` })] });
      return;
    }

    if (command === 'league') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const p = recoverPlayer(profile);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${p.club} · Season ${p.league.season}`).setDescription(`Matchday **${p.league.matchday}**\nPoints **${p.league.points}**\nRecord **${p.league.wins}-${p.league.draws}-${p.league.losses}**\nGoals **${p.league.goalsFor}–${p.league.goalsAgainst}**`).addFields({ name: 'Next step', value: 'Gunakan `/match` untuk memainkan pertandingan berikutnya.' })] });
      return;
    }

    if (command === 'help') {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Football Rising Star — Bantuan').setDescription('Bangun karier pemain Anda melalui pertandingan dan latihan.').addFields({ name: 'Mulai', value: '`/start position:FW` membuat profil awal.' }, { name: 'Progression', value: '`/profile` melihat atribut.\n`/train ability:technique` menambah EXP ability.' }, { name: 'Competition', value: '`/match` menjalankan simulasi pertandingan.\n`/league` melihat progres musim.' }, { name: 'Catatan MVP', value: 'Cooldown, transfer market, event, Champions League, dan database produksi akan ditambahkan pada fase berikutnya.' })] });
      return;
    }

    await interaction.reply({ content: 'Command belum dikenali.', ephemeral: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}
