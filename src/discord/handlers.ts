import { ChatInputCommandInteraction, EmbedBuilder, type ColorResolvable } from 'discord.js';
import { createInitialProfile, formatAbility, getRating, playMatch, recoverPlayer, trainPlayer } from '../domain/engine.js';
import { ensureClubState, finishSeason, formatClubStanding, getClubRating, getNextClubFixture, playClubMatch, setClubFormation, setClubTactic } from '../domain/club-engine.js';
import { buyMarketPlayer, claimDailyReward, formatMoney, generateDailyEvent, refreshMarket, resolveDailyEvent, sellClubPlayer } from '../domain/progression-engine.js';
import { claimAchievement, formatAchievements, playChampionsLeague, startChampionsLeague, syncAchievements } from '../domain/competition-engine.js';
import { ABILITY_LABELS, FORMATIONS, POSITION_LABELS, TACTICS, type AbilityId, type PlayerProfile, type Position } from '../domain/types.js';
import type { PlayerStore } from '../storage/json-store.js';

const BRAND_COLOR: ColorResolvable = '#1f8b4c';
const ADMIN_USER_IDS = new Set((process.env.ADMIN_USER_IDS ?? '').split(',').map((value) => value.trim()).filter(Boolean));

function profileEmbed(profile: PlayerProfile): EmbedBuilder {
  const abilities = Object.entries(profile.abilities)
    .map(([id, state]) => `${ABILITY_LABELS[id as AbilityId]}: **${profile.stats[id as AbilityId]}** (Lv ${state.level}, ${state.exp} EXP)`)
    .join('\n');
  const club = profile.clubState;
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(`${profile.displayName} — Football Rising Star`)
    .setDescription(`**${POSITION_LABELS[profile.position]}** · ${profile.club} · Player rating **${getRating(profile)}**`)
    .addFields(
      { name: 'Condition', value: `HP **${profile.hp}/${profile.maxHp}**\nEnergy **${profile.energy}/${profile.maxEnergy}**\nMoney **${formatMoney(profile.money)}**`, inline: true },
      { name: 'Career', value: `Level **${profile.level}**\nEXP **${profile.totalExp}**\nAge **${profile.age}**`, inline: true },
      { name: 'Club', value: club ? `Club rating **${getClubRating(profile)}**\nPrestige **${club.prestige}**\nAssets **${formatMoney(club.assets)}**\n${club.formation} · ${TACTICS[club.tactic].name}` : 'Gunakan `/club` untuk membuat state klub.', inline: true },
      { name: 'Abilities', value: abilities || 'Belum ada ability.' },
      { name: 'Career statistics', value: `Appearances **${profile.career.appearances}** · W-D-L **${profile.career.wins}-${profile.career.draws}-${profile.career.losses}**\nGoals **${profile.career.goals}** · Assists **${profile.career.assists}** · Clean sheets **${profile.career.cleanSheets}**` }
    )
    .setFooter({ text: 'Football Rising Star Discord · Formula pertandingan modular untuk kalibrasi internal.' });
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
      let profile = createInitialProfile(interaction.user.id, interaction.user.globalName ?? interaction.user.username, position);
      profile = ensureClubState(profile);
      profile = refreshMarket(profile);
      profile = generateDailyEvent(profile);
      await store.save(profile);
      await interaction.reply({ embeds: [profileEmbed(profile)] });
      return;
    }

    if (command === 'profile') {
      const profile = await requireProfile(interaction, store);
      if (profile) {
        const enriched = ensureClubState(recoverPlayer(profile));
        await store.save(enriched);
        await interaction.reply({ embeds: [profileEmbed(enriched)] });
      }
      return;
    }

    if (command === 'train') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const ability = interaction.options.getString('ability', true) as AbilityId;
      const result = trainPlayer(profile, ability);
      await store.save(result.profile);
      const levelText = result.levelUp ? '\n**Level ability naik.**' : '';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Training selesai').setDescription(`**${formatAbility(result.ability)}** bertambah dari **${result.statBefore}** menjadi **${result.statAfter}**. EXP diperoleh: **${result.expGained}**.${levelText}`).addFields({ name: 'Sisa energi', value: `${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }, { name: 'Player rating', value: `${getRating(result.profile)}`, inline: true })] });
      return;
    }

    if (command === 'match') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = playMatch(profile);
      await store.save(result.profile);
      const outcomeLabel = result.record.outcome === 'WIN' ? 'VICTORY' : result.record.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${outcomeLabel} · ${result.profile.club} ${result.record.playerGoals}–${result.record.opponentGoals} ${result.record.opponent}`).setDescription(result.narrative.join('\n')).addFields({ name: 'Player score', value: `${result.record.playerScore}`, inline: true }, { name: 'Rewards', value: `${formatMoney(result.record.rewards.money)} money\n${result.record.rewards.exp} EXP`, inline: true }, { name: 'Condition', value: `HP ${result.profile.hp}/${result.profile.maxHp}\nEnergy ${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }).setFooter({ text: `Season ${result.profile.league.season} · Matchday ${result.profile.league.matchday}` })] });
      return;
    }

    if (command === 'league' || command === 'standings') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(recoverPlayer(profile));
      await store.save(enriched);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.club} · Season ${enriched.league.season}`).setDescription(formatClubStanding(enriched)).addFields({ name: 'Progress', value: `Matchday **${enriched.league.matchday}**\nPoints **${enriched.league.points}**\nRecord **${enriched.league.wins}-${enriched.league.draws}-${enriched.league.losses}**\nGoals **${enriched.league.goalsFor}–${enriched.league.goalsAgainst}**` })] });
      return;
    }

    if (command === 'club') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(profile);
      await store.save(enriched);
      const club = enriched.clubState!;
      const fixture = getNextClubFixture(enriched);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${club.name} · Club Office`).setDescription(`Club rating **${getClubRating(enriched)}** · Level **${club.level}**`).addFields({ name: 'Resources', value: `Prestige **${club.prestige}**\nAssets **${formatMoney(club.assets)}**\nSalary budget **${formatMoney(club.salaryBudget)}**`, inline: true }, { name: 'Strategy', value: `Formation **${club.formation}**\nTactic **${TACTICS[club.tactic].name}**\n${TACTICS[club.tactic].description}`, inline: true }, { name: 'Next fixture', value: fixture ? `Matchday ${fixture.matchday}: ${fixture.homeClub} vs ${fixture.awayClub}\n${fixture.playedAt}` : 'Tidak ada fixture tersisa.' })] });
      return;
    }

    if (command === 'squad') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(profile);
      await store.save(enriched);
      const roster = enriched.clubState!.roster.map((player) => `${player.id} · ${player.name} · ${player.position} · OVR ${player.overall} · HP ${player.hp}/${player.maxHp}${player.isUserPlayer ? ' · **YOU**' : ''}`).join('\n');
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.club} · Squad`).setDescription(roster.slice(0, 3900)).addFields({ name: 'Tip', value: 'Gunakan ID pemain pada `/sell-player` untuk melepas pemain non-user.' })] });
      return;
    }

    if (command === 'formation') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const formation = interaction.options.getString('id', true) as keyof typeof FORMATIONS;
      const updated = setClubFormation(profile, formation);
      await store.save(updated);
      await interaction.reply(`Formasi klub diubah menjadi **${FORMATIONS[formation].name}**.`);
      return;
    }

    if (command === 'tactic') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const tactic = interaction.options.getString('id', true) as keyof typeof TACTICS;
      const updated = setClubTactic(profile, tactic);
      await store.save(updated);
      await interaction.reply(`Taktik klub diubah menjadi **${TACTICS[tactic].name}** — ${TACTICS[tactic].description}`);
      return;
    }

    if (command === 'club-match') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = playClubMatch(profile);
      await store.save(result.profile);
      const label = result.outcome === 'WIN' ? 'VICTORY' : result.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${label} · ${result.homeGoals}–${result.awayGoals}`).setDescription(result.commentary.join('\n')).addFields({ name: 'Fixture', value: `${result.fixture.homeClub} vs ${result.fixture.awayClub}`, inline: true }, { name: 'MVP', value: `${result.mvp.name} · OVR ${result.mvp.overall}`, inline: true }, { name: 'Club resources', value: `${formatMoney(result.profile.clubState!.assets)} assets\n${result.profile.clubState!.prestige} prestige`, inline: true })] });
      return;
    }

    if (command === 'season-end') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(profile);
      if (enriched.clubState!.fixtures.some((fixture) => !fixture.played)) throw new Error('Belum semua fixture selesai. Selesaikan seluruh pertandingan sebelum menutup musim.');
      const updated = finishSeason(enriched);
      await store.save(updated);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Season ${updated.league.season - 1} selesai`).setDescription(`Season baru **${updated.league.season}** dimulai. Champions League: **${updated.clubState!.championsLeagueQualified ? 'qualified' : 'not qualified'}**.`)] });
      return;
    }

    if (command === 'daily') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = claimDailyReward(profile);
      await store.save(result.profile);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Daily reward claimed').setDescription(`Anda menerima **${formatMoney(result.amount)} money** dan **${result.exp} EXP**.`).addFields({ name: 'Streak', value: `${result.streak} hari`, inline: true }, { name: 'Balance', value: formatMoney(result.profile.money), inline: true })] });
      return;
    }

    if (command === 'event') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const choiceId = interaction.options.getString('choice');
      let enriched = generateDailyEvent(profile);
      if (choiceId) {
        const result = resolveDailyEvent(enriched, choiceId);
        await store.save(result.profile);
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${result.profile.event!.title} · Resolved`).setDescription(`Pilihan: **${result.choice.label}**\nReward: **${result.choice.rewardMoney} money** dan **${result.choice.rewardExp} EXP**.`)] });
      } else {
        await store.save(enriched);
        const event = enriched.event!;
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(event.title).setDescription(`${event.description}\n\n${event.choices.map((choice) => `**${choice.id}** — ${choice.label} (cost ${choice.cost}, reward ${choice.rewardMoney} money / ${choice.rewardExp} EXP)`).join('\n')}`).setFooter({ text: 'Pilih dengan /event choice:<id>' })] });
      }
      return;
    }

    if (command === 'market') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'list';
      const enriched = action === 'refresh' || !profile.market?.length ? refreshMarket(profile) : profile;
      await store.save(enriched);
      const listings = enriched.market!.filter((item) => item.status === 'OPEN').map((item) => `**${item.id}** · ${item.player.name} · ${item.player.position} · OVR ${item.player.overall} · **${formatMoney(item.price)}**`).join('\n');
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Transfer Market').setDescription(listings || 'Market kosong. Gunakan action refresh.') .setFooter({ text: 'Gunakan /buy-player listing:<id> untuk membeli.' })] });
      return;
    }

    if (command === 'buy-player') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const listingId = interaction.options.getString('listing', true);
      const result = buyMarketPlayer(profile, listingId);
      await store.save(result.profile);
      await interaction.reply(`Transfer berhasil: **${result.listing.player.name}** bergabung dengan klub untuk **${formatMoney(result.listing.price)}**.`);
      return;
    }

    if (command === 'sell-player') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const playerId = interaction.options.getString('player', true);
      const result = sellClubPlayer(profile, playerId);
      await store.save(result.profile);
      await interaction.reply(`**${result.player.name}** dijual dengan harga **${formatMoney(result.price)}**.`);
      return;
    }

    if (command === 'champions') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'status';
      if (action === 'play') {
        const result = playChampionsLeague(profile);
        await store.save(result.profile);
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Champions League · ${result.status}`).setDescription(result.commentary.join('\\n')).addFields({ name: 'Reward state', value: result.status === 'CHAMPION' ? 'Club assets and prestige increased.' : 'Continue the competition from the next round.', inline: true })] });
      } else {
        const enriched = startChampionsLeague(profile);
        await store.save(enriched);
        const state = enriched.championsLeague!;
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Champions League · Status').setDescription(`Status **${state.status}**\nRound **${state.round}**\nOpponent **${state.opponent}**\nAggregate **${state.aggregate}**`).setFooter({ text: 'Gunakan /champions action:play untuk memainkan ronde.' })] });
      }
      return;
    }

    if (command === 'achievements') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = syncAchievements(profile);
      await store.save(enriched);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Achievements').setDescription(formatAchievements(enriched))] });
      return;
    }

    if (command === 'claim-achievement') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const achievementId = interaction.options.getString('achievement', true);
      const result = claimAchievement(profile, achievementId);
      await store.save(result.profile);
      await interaction.reply(`Achievement **${result.achievement.title}** diklaim: **${formatMoney(result.achievement.rewardMoney)} money** dan **${result.achievement.rewardExp} EXP**.`);
      return;
    }

    if (command === 'admin') {
      if (!ADMIN_USER_IDS.has(interaction.user.id)) throw new Error('Anda tidak memiliki akses admin.');
      const action = interaction.options.getString('action', true);
      const profiles = await store.all();
      if (action === 'stats') {
        const averageLevel = profiles.length ? profiles.reduce((sum, profile) => sum + profile.level, 0) / profiles.length : 0;
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Bot Operations').setDescription(`Profiles **${profiles.length}**\nAverage player level **${averageLevel.toFixed(2)}**\nPersistence **${process.env.DATABASE_URL ? 'PostgreSQL' : 'JSON'}**\nNode environment **${process.env.NODE_ENV ?? 'development'}**`)] });
      } else if (action === 'refresh-markets') {
        for (const profile of profiles) await store.save(refreshMarket(profile));
        await interaction.reply(`Market refreshed untuk **${profiles.length}** profile(s).`);
      }
      return;
    }

    if (command === 'help') {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Football Rising Star — Panduan').setDescription('Bangun karier pemain dan kelola klub melalui dua loop gameplay.').addFields({ name: 'Career', value: '`/start`, `/profile`, `/train`, `/match`, `/league`' }, { name: 'Club', value: '`/club`, `/squad`, `/formation`, `/tactic`, `/club-match`, `/standings`, `/season-end`' }, { name: 'Economy & events', value: '`/daily`, `/event`, `/market`, `/buy-player`, `/sell-player`' }, { name: 'Production roadmap', value: 'Tinggal menambahkan database production, admin seed, Champions League detail, achievements, contracts, dan kalibrasi formula resmi.' })] });
      return;
    }

    await interaction.reply({ content: 'Command belum dikenali.', ephemeral: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.';
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: message, ephemeral: true });
    else await interaction.reply({ content: message, ephemeral: true });
  }
}
