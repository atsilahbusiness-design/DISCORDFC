import { ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuInteraction, type ColorResolvable } from 'discord.js';
import { createInitialProfile, formatAbility, getRating, playMatch, recoverPlayer, trainPlayer } from '../domain/engine.js';
import { ensureClubState, finishSeason, formatClubStanding, getClubRating, getNextClubFixture, playClubMatch, setClubFormation, setClubTactic } from '../domain/club-engine.js';
import { buyMarketPlayer, claimDailyReward, formatMoney, generateDailyEvent, refreshMarket, resolveDailyEvent, sellClubPlayer } from '../domain/progression-engine.js';
import { claimAchievement, formatAchievements, playChampionsLeague, startChampionsLeague, syncAchievements } from '../domain/competition-engine.js';
import { advanceWeek, assignMatchExp, ensureGameplayState, formatDetailedSkills, formatGameplayStatus, hireTrainer, listTrainerCatalog, rebirthPlayer, releaseTrainer, retirePlayer, startCultureStudy, startTrickTraining, trainDetailedSkill, treatInjury } from '../domain/gameplay-engine.js';
import { formatContract, getContractStatus, renewContract, signContract } from '../domain/contract-engine.js';
import { joinOfficialClub, listOfficialClubs } from '../domain/official-club-engine.js';
import { acceptJobOffer, advanceCoachRound, assignCoachExp, createCoachCareer, declineJobOffer, formatCoachProfile, generateJobOffer, rebirthCoach, resolveCoachEvent, retireCoach, settleCoachSeason } from '../domain/coach-career-engine.js';
import { createVersusClub, createVersusSeason, enrollVersus, formatVersusBattle, formatVersusProfile, getVersusStandings, processVersusRound, settleVersusSeason, syncVersusProfileWithSeason } from '../domain/versus-engine.js';
import { ABILITY_LABELS, COACH_ABILITIES, COACH_ABILITY_LABELS, DETAILED_SKILL_LABELS, DETAILED_SKILLS, FORMATIONS, HONOR_CATEGORY_LABELS, POSITION_LABELS, TACTICS, TRAINER_CATALOG, TRICK_CATALOG, type AbilityId, type CoachAbilityId, type CultureSubject, type DetailedSkillId, type PlayerProfile, type Position } from '../domain/types.js';
import type { PlayerStore } from '../storage/json-store.js';
import { careerControls, detailedTrainingControls, trainingControls } from './components.js';
import { log } from '../observability/logger.js';

const BRAND_COLOR: ColorResolvable = '#1f8b4c';
const ADMIN_USER_IDS = new Set((process.env.ADMIN_USER_IDS ?? '').split(',').map((value) => value.trim()).filter(Boolean));

function profileEmbed(profile: PlayerProfile): EmbedBuilder {
  const abilities = Object.entries(profile.abilities)
    .map(([id, state]) => `${ABILITY_LABELS[id as AbilityId]}: **${profile.stats[id as AbilityId]}** (Lv ${state.level}, ${state.exp} EXP)`)
    .join('\n');
  const detailed = profile.detailedSkills ? formatDetailedSkills(profile) : 'Jalankan `/skills` untuk menginisialisasi detailed skill state.';
  const gameplay = profile.detailedSkills ? formatGameplayStatus(profile) : 'Legacy profile; gameplay state akan dimigrasikan saat `/skills` atau `/next-week`.';
  const club = profile.clubState;
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(`${profile.displayName} — Football Rising Star`)
    .setDescription(`**${POSITION_LABELS[profile.position]}** · ${profile.club} · Player rating **${getRating(profile)}**`)
    .addFields(
      { name: 'Condition', value: `HP **${profile.hp}/${profile.maxHp}**\nEnergy **${profile.energy}/${profile.maxEnergy}**\nMoney **${formatMoney(profile.money)}**`, inline: true },
      { name: 'Career', value: `Level **${profile.level}**\nEXP **${profile.totalExp}**\nAge **${profile.age}**`, inline: true },
      { name: 'Club', value: club ? `Club rating **${getClubRating(profile)}**\nPrestige **${club.prestige}**\nAssets **${formatMoney(club.assets)}**\n${club.formation} · ${TACTICS[club.tactic].name}` : 'Gunakan `/club` untuk membuat state klub.', inline: true },
      { name: 'Macro abilities', value: abilities || 'Belum ada ability.' },
      { name: 'Detailed skills', value: detailed },
      { name: 'Gameplay state', value: gameplay },
      { name: 'Career statistics', value: `Appearances **${profile.career.appearances}** · W-D-L **${profile.career.wins}-${profile.career.draws}-${profile.career.losses}**\nGoals **${profile.career.goals}** · Assists **${profile.career.assists}** · Clean sheets **${profile.career.cleanSheets}**` }
    )
    .setFooter({ text: 'Football Rising Star Discord · Formula pertandingan modular untuk kalibrasi internal.' });
}

async function requireProfile(interaction: ChatInputCommandInteraction, store: PlayerStore): Promise<PlayerProfile | undefined> {
  const profile = await store.get(interaction.user.id);
  if (!profile) {
    await interaction.editReply({ content: 'Profil belum dibuat. Jalankan `/start position:<GK|DF|MF|FW>` terlebih dahulu.' });
    return undefined;
  }
  return profile;
}

async function versusMembers(store: PlayerStore, groupCode: string): Promise<PlayerProfile[]> {
  return (await store.all()).filter((profile) => profile.versus?.groupCode === groupCode);
}

async function versusSeasonFor(store: PlayerStore, groupCode: string, now: Date): Promise<{ season: import('../domain/types.js').VersusSeason; members: PlayerProfile[] }> {
  const members = await versusMembers(store, groupCode);
  if (members.length === 0) throw new Error('Belum ada anggota pada Versus group ini.');
  const existing = members.find((profile) => profile.versus?.season)?.versus?.season;
  return { season: existing && existing.state !== 'FINISHED' ? structuredClone(existing) : createVersusSeason(groupCode, members, now), members };
}

async function persistVersusSeason(store: PlayerStore, season: import('../domain/types.js').VersusSeason, now: Date): Promise<void> {
  const members = await versusMembers(store, season.groupCode);
  for (const member of members) await store.save(syncVersusProfileWithSeason(member, season, now));
}

const versusGroupQueues = new Map<string, Promise<void>>();

async function withVersusGroupLock<T>(groupCode: string, operation: () => Promise<T>): Promise<T> {
  const previous = versusGroupQueues.get(groupCode) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  versusGroupQueues.set(groupCode, queued);
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (versusGroupQueues.get(groupCode) === queued) versusGroupQueues.delete(groupCode);
  }
}

export async function handleCommand(interaction: ChatInputCommandInteraction, store: PlayerStore): Promise<void> {
  const command = interaction.commandName;
  try {
    if (!interaction.replied && !interaction.deferred) await interaction.deferReply();
    if (command === 'start') {
      const existing = await store.get(interaction.user.id);
      if (existing) {
        await interaction.editReply({ content: 'Profil Anda sudah ada. Gunakan `/profile` untuk melihatnya.' });
        return;
      }
      const position = interaction.options.getString('position', true) as Position;
      let profile = createInitialProfile(interaction.user.id, interaction.user.globalName ?? interaction.user.username, position);
      profile = ensureClubState(profile);
      profile = refreshMarket(profile);
      profile = generateDailyEvent(profile);
      await store.save(profile);
      await interaction.editReply({ embeds: [profileEmbed(profile)], components: careerControls(interaction.user.id) });
      return;
    }

    if (command === 'profile') {
      const profile = await requireProfile(interaction, store);
      if (profile) {
        const enriched = ensureClubState(recoverPlayer(profile));
        await store.save(enriched);
        await interaction.editReply({ embeds: [profileEmbed(enriched)] });
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
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Training selesai').setDescription(`**${formatAbility(result.ability)}** bertambah dari **${result.statBefore}** menjadi **${result.statAfter}**. EXP diperoleh: **${result.expGained}**.${levelText}`).addFields({ name: 'Sisa energi', value: `${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }, { name: 'Player rating', value: `${getRating(result.profile)}`, inline: true })] });
      return;
    }

    if (command === 'skills') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureGameplayState(profile);
      await store.save(enriched);
      const tricks = Object.values(TRICK_CATALOG).map((trick) => `${enriched.unlockedTricks?.includes(trick.id) ? 'UNLOCKED' : 'LOCKED'} · **${trick.name}** · requires ${Object.entries(trick.requires).map(([skill, level]) => `${DETAILED_SKILL_LABELS[skill as DetailedSkillId]} ${level}`).join(', ')}`).join('\n');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.displayName} · Detailed Skills`).setDescription(formatDetailedSkills(enriched)).addFields({ name: 'Gameplay state', value: formatGameplayStatus(enriched) }, { name: 'Tricks', value: tricks || 'Belum ada trick catalog.' })] });
      return;
    }

    if (command === 'train-skill') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const skill = interaction.options.getString('skill', true) as DetailedSkillId;
      const result = trainDetailedSkill(profile, skill);
      await store.save(result.profile);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Detailed training dimulai').setDescription(`**${DETAILED_SKILL_LABELS[result.skill]}**: Lv ${result.levelBefore} · reward **+${result.expGained} EXP** pada week ${result.profile.activeTraining?.completeAtWeek}.`).addFields({ name: 'Condition', value: `Energy ${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }, { name: 'Macro rating', value: `${getRating(result.profile)}`, inline: true }).setFooter({ text: 'Gunakan /next-week untuk menyelesaikan training order.' })] });
      return;
    }

    if (command === 'assign-exp') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const skill = interaction.options.getString('skill', true) as DetailedSkillId;
      const amount = interaction.options.getInteger('amount', true);
      const result = assignMatchExp(profile, { [skill]: amount });
      await store.save(result.profile);
      await interaction.editReply(`EXP dialokasikan ke **${DETAILED_SKILL_LABELS[skill]}**: **${result.allocated}**. Sisa pending EXP: **${result.remaining}**.`);
      return;
    }

    if (command === 'next-week') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = advanceWeek(profile);
      await store.save(result.profile);
      const matchText = result.match ? `Match: ${result.match.outcome} ${result.match.playerGoals}-${result.match.opponentGoals} vs ${result.match.opponent}` : 'Tidak ada match yang dimainkan minggu ini.';
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Week ${result.week} selesai`).setDescription(result.narrative.join('\n')).addFields({ name: 'Match', value: matchText }, { name: 'Pending EXP', value: `${result.expAwaitingAssignment}`, inline: true }, { name: 'Status', value: `${result.profile.careerStatus} · age ${result.profile.age} · year ${result.profile.careerYear} · week ${result.profile.careerWeek}`, inline: true }).setFooter({ text: result.retired ? 'Gunakan /rebirth setelah retirement.' : result.expAwaitingAssignment > 0 ? 'Gunakan /assign-exp sebelum /next-week berikutnya.' : 'Gunakan /skills untuk melihat progression.' })] });
      return;
    }

    if (command === 'injury') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'view';
      if (action === 'view') {
        const enriched = ensureGameplayState(profile);
        await store.save(enriched);
        await interaction.editReply(enriched.injury ? `Cedera **${enriched.injury.severity}** · tersisa **${enriched.injury.weeksRemaining} minggu** · source ${enriched.injury.source}. Treatment used: ${enriched.injury.treatmentUsed ? 'yes' : 'no'}.` : 'Pemain sedang sehat.');
      } else {
        const treatment = action === 'expert-treatment' ? 'EXPERT' : 'BASIC';
        const result = treatInjury(profile, treatment);
        await store.save(result.profile);
        await interaction.editReply(`Treatment **${result.treatment}** selesai. Durasi dikurangi **${result.weeksRemoved} minggu**; biaya **${formatMoney(result.moneySpent)}**. ${result.profile.injury ? `Sisa cedera: ${result.profile.injury.weeksRemaining} minggu.` : 'Cedera sudah pulih.'}`);
      }
      return;
    }

    if (command === 'trick') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'list';
      if (action === 'train') {
        const trickId = interaction.options.getString('trick_id');
        if (!trickId) throw new Error('Masukkan trick_id, contoh `bicycle-kick`.');
        const result = startTrickTraining(profile, trickId);
        await store.save(result.profile);
        await interaction.editReply(result.message);
      } else {
        const enriched = ensureGameplayState(profile);
        await store.save(enriched);
        const list = Object.values(TRICK_CATALOG).map((trick) => `${enriched.unlockedTricks?.includes(trick.id) ? 'UNLOCKED' : 'LOCKED'} · **${trick.id}** — ${trick.name}; requires ${Object.entries(trick.requires).map(([skill, level]) => `${DETAILED_SKILL_LABELS[skill as DetailedSkillId]} ${level}`).join(', ')}`).join('\n');
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Trick Training').setDescription(list)] });
      }
      return;
    }

    if (command === 'trainer') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'list';
      if (action === 'hire') {
        const trainerId = interaction.options.getString('trainer_id');
        if (!trainerId) throw new Error('Masukkan trainer_id, contoh `junior-physical`.');
        const result = hireTrainer(profile, trainerId);
        await store.save(result.profile);
        await interaction.editReply(result.message);
      } else if (action === 'release') {
        const result = releaseTrainer(profile);
        await store.save(result.profile);
        await interaction.editReply(result.message);
      } else {
        const enriched = ensureGameplayState(profile);
        await store.save(enriched);
        const list = listTrainerCatalog().map((trainer) => `${enriched.trainer?.id === trainer.id && enriched.trainer.active ? 'ACTIVE' : 'AVAILABLE'} · **${trainer.id}** · ${trainer.tier} · ${trainer.type} · ratio ${(trainer.ratio * 100).toFixed(0)}% · ${formatMoney(trainer.weeklyCost)}/week`).join('\n');
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Personal Trainers').setDescription(list)] });
      }
      return;
    }

    if (command === 'culture') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const subject = interaction.options.getString('subject', true) as CultureSubject;
      const result = startCultureStudy(profile, subject);
      await store.save(result.profile);
      await interaction.editReply(result.message);
      return;
    }

    if (command === 'honors') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureGameplayState(profile);
      await store.save(enriched);
      const categories = (['PERSONAL', 'TEAM', 'NATIONAL'] as const).map((category) => {
        const honors = enriched.honors!.filter((honor) => honor.category === category);
        return `**${HONOR_CATEGORY_LABELS[category]}**\n${honors.length ? honors.map((honor) => `${honor.title} · season ${honor.season}`).join('\n') : 'Belum ada honor.'}`;
      }).join('\n\n');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Hall of Honor').setDescription(categories)] });
      return;
    }

    if (command === 'world-footballer') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureGameplayState(profile);
      await store.save(enriched);
      const award = enriched.worldFootballer;
      await interaction.editReply(award ? `World Footballer season **${award.season}**: **${award.winner}**. User score: **${award.userScore}**. Result: **${award.userWon ? 'WIN' : 'candidate'}**.` : 'Belum ada hasil World Footballer. Selesaikan satu season melalui /next-week.');
      return;
    }

    if (command === 'retire') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = retirePlayer(profile);
      await store.save(result.profile);
      await interaction.editReply(result.message);
      return;
    }

    if (command === 'rebirth') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = rebirthPlayer(profile);
      await store.save(result.profile);
      await interaction.editReply(result.message);
      return;
    }

    if (command === 'match') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = playMatch(profile);
      await store.save(result.profile);
      const outcomeLabel = result.record.outcome === 'WIN' ? 'VICTORY' : result.record.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${outcomeLabel} · ${result.profile.club} ${result.record.playerGoals}–${result.record.opponentGoals} ${result.record.opponent}`).setDescription(result.narrative.join('\n')).addFields({ name: 'Player score', value: `${result.record.playerScore}`, inline: true }, { name: 'Rewards', value: `${formatMoney(result.record.rewards.money)} money\n${result.record.rewards.exp} EXP`, inline: true }, { name: 'Condition', value: `HP ${result.profile.hp}/${result.profile.maxHp}\nEnergy ${result.profile.energy}/${result.profile.maxEnergy}`, inline: true }).setFooter({ text: `Season ${result.profile.league.season} · Matchday ${result.profile.league.matchday}` })] });
      return;
    }

    if (command === 'league' || command === 'standings') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(recoverPlayer(profile));
      await store.save(enriched);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.club} · Season ${enriched.league.season}`).setDescription(formatClubStanding(enriched)).addFields({ name: 'Progress', value: `Matchday **${enriched.league.matchday}**\nPoints **${enriched.league.points}**\nRecord **${enriched.league.wins}-${enriched.league.draws}-${enriched.league.losses}**\nGoals **${enriched.league.goalsFor}–${enriched.league.goalsAgainst}**` })] });
      return;
    }

    if (command === 'club') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(profile);
      await store.save(enriched);
      const club = enriched.clubState!;
      const fixture = getNextClubFixture(enriched);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${club.name} · Club Office`).setDescription(`Club rating **${getClubRating(enriched)}** · Level **${club.level}**`).addFields({ name: 'Resources', value: `Prestige **${club.prestige}**\nAssets **${formatMoney(club.assets)}**\nSalary budget **${formatMoney(club.salaryBudget)}**`, inline: true }, { name: 'Strategy', value: `Formation **${club.formation}**\nTactic **${TACTICS[club.tactic].name}**\n${TACTICS[club.tactic].description}`, inline: true }, { name: 'Next fixture', value: fixture ? `Matchday ${fixture.matchday}: ${fixture.homeClub} vs ${fixture.awayClub}\n${fixture.playedAt}` : 'Tidak ada fixture tersisa.' })] });
      return;
    }

    if (command === 'clubs') {
      const league = interaction.options.getInteger('league') ?? undefined;
      const clubs = listOfficialClubs(league).slice(0, 40);
      const description = clubs.map((club) => `**${club.id}** · ${club.nameEn} · league ${club.league} · grade ${club.grade} · prestige ${club.prestige.toFixed(2)}`).join('\n');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Official Clubs${league ? ` · League ${league}` : ''}`).setDescription(description || 'Tidak ada club untuk filter ini.').setFooter({ text: 'Gunakan /join-club club_id:<id> untuk pindah klub.' })] });
      return;
    }

    if (command === 'join-club') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const clubId = interaction.options.getInteger('club_id', true);
      const updated = joinOfficialClub(profile, clubId);
      await store.save(updated);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Transfer · ${updated.club}`).setDescription(`Anda bergabung dengan **${updated.club}**.\nOfficial club ID: **${updated.clubState?.officialId}**\nProvenance: **${updated.clubState?.provenance}**\nSaldo: **${formatMoney(updated.money)}**`)] });
      return;
    }

    if (command === 'squad') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = ensureClubState(profile);
      await store.save(enriched);
      const roster = enriched.clubState!.roster.map((player) => `${player.id} · ${player.name} · ${player.position} · OVR ${player.overall} · HP ${player.hp}/${player.maxHp}${player.isUserPlayer ? ' · **YOU**' : ''}`).join('\n');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.club} · Squad`).setDescription(roster.slice(0, 3900)).addFields({ name: 'Tip', value: 'Gunakan ID pemain pada `/sell-player` untuk melepas pemain non-user.' })] });
      return;
    }

    if (command === 'formation') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const formation = interaction.options.getString('id', true) as keyof typeof FORMATIONS;
      const mode = interaction.options.getString('mode') ?? 'PLAYER';
      if (mode === 'COACH' && !profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
      const updated = setClubFormation(profile, formation, new Date(), mode === 'COACH' ? 'coachClubState' : 'clubState');
      await store.save(updated);
      await interaction.editReply(`Formasi **${mode}** diubah menjadi **${FORMATIONS[formation].name}**.`);
      return;
    }

    if (command === 'tactic') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const tactic = interaction.options.getString('id', true) as keyof typeof TACTICS;
      const mode = interaction.options.getString('mode') ?? 'PLAYER';
      if (mode === 'COACH' && !profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
      const updated = setClubTactic(profile, tactic, new Date(), mode === 'COACH' ? 'coachClubState' : 'clubState');
      await store.save(updated);
      await interaction.editReply(`Taktik **${mode}** diubah menjadi **${TACTICS[tactic].name}** — ${TACTICS[tactic].description}`);
      return;
    }

    if (command === 'club-match') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = playClubMatch(profile);
      await store.save(result.profile);
      const label = result.outcome === 'WIN' ? 'VICTORY' : result.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${label} · ${result.homeGoals}–${result.awayGoals}`).setDescription(result.commentary.join('\n')).addFields({ name: 'Fixture', value: `${result.fixture.homeClub} vs ${result.fixture.awayClub}`, inline: true }, { name: 'Halftime', value: `${result.halftime.homeGoals}–${result.halftime.awayGoals}`, inline: true }, { name: 'MVP', value: `${result.mvp.name} · OVR ${result.mvp.overall}`, inline: true }, { name: 'Club resources', value: `${formatMoney(result.profile.clubState!.assets)} assets\n${result.profile.clubState!.prestige} prestige`, inline: true })] });
      return;
    }

    if (command === 'coach-career') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'status';
      const updated = action === 'start' ? createCoachCareer(profile, interaction.user.globalName ?? interaction.user.username) : profile;
      if (!updated.coach) throw new Error('Karier Coach belum dibuat. Pilih action `start` terlebih dahulu.');
      await store.save(updated);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${updated.coach.coachName} · Coach Career`).setDescription(formatCoachProfile(updated)).setFooter({ text: 'Coach Mode terpisah dari Player career; gunakan /coach-round untuk memainkan fixture.' })] });
      return;
    }

    if (command === 'coach-profile') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${profile.coach.coachName} · Coach Profile`).setDescription(formatCoachProfile(profile)).addFields({ name: 'Club', value: `${profile.coachClubState?.name ?? profile.club} · tier ${profile.coachClubState?.leagueTier ?? 1}`, inline: true }, { name: 'Round', value: `${profile.coachClubState?.fixtures.filter((fixture) => fixture.played).length ?? 0}/${profile.coachClubState?.fixtures.length ?? 0}`, inline: true }, { name: 'Honors', value: `${profile.coach.honors.length}`, inline: true })] });
      return;
    }

    if (command === 'coach-event') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
      const event = profile.coach.event;
      const choiceId = interaction.options.getString('choice');
      if (!event || event.resolved) {
        await interaction.editReply('Tidak ada Coach event yang menunggu keputusan. Event baru muncul secara berkala setelah `/coach-round`.');
        return;
      }
      if (choiceId) {
        const updated = resolveCoachEvent(profile, choiceId);
        await store.save(updated);
        await interaction.editReply(`Coach event **${event.title}** diselesaikan. Approval sekarang **${updated.coach!.approval}/100**; unassigned Coach EXP **${updated.coach!.unassignedExp}**.`);
      } else {
        const choices = event.choices.map((choice) => `**${choice.id}** — ${choice.label}: ${choice.description}`).join('\n');
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Coach Event · ${event.title}`).setDescription(`${event.description}\n\n${choices}`).setFooter({ text: 'Gunakan /coach-event choice:<id> untuk memilih.' })] });
      }
      return;
    }

    if (command === 'coach-round') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = advanceCoachRound(profile);
      await store.save(result.profile);
      const eventText = result.event ? `\nCoach event baru: **${result.event.title}** — gunakan /coach-event untuk mengambil keputusan.` : '';
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Coach Round · ${result.match.outcome}`).setDescription(result.match.commentary.join('\n') + eventText).addFields({ name: 'Score', value: `${result.match.homeGoals}–${result.match.awayGoals} (HT ${result.match.halftime.homeGoals}–${result.match.halftime.awayGoals})`, inline: true }, { name: 'Coach EXP', value: `+${result.coachExp} · pending ${result.profile.coach!.unassignedExp}`, inline: true }, { name: 'Approval', value: `${result.profile.coach!.approval}/100 (${result.approvalDelta >= 0 ? '+' : ''}${result.approvalDelta})`, inline: true }, { name: 'Board target', value: `${result.boardTarget.type} · rank ${result.boardTarget.progressRank ?? '-'}/${result.boardTarget.targetRank}`, inline: true })] });
      return;
    }

    if (command === 'coach-exp') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const ability = interaction.options.getString('ability', true) as CoachAbilityId;
      const amount = interaction.options.getInteger('amount', true);
      const result = assignCoachExp(profile, { [ability]: amount });
      await store.save(result.profile);
      await interaction.editReply(`Coach EXP **${amount}** dialokasikan ke **${COACH_ABILITY_LABELS[ability]}**. Sisa EXP **${result.remaining}**; level naik **${result.levelsGained}**.`);
      return;
    }

    if (command === 'coach-job') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'list';
      const offerId = interaction.options.getString('offer_id');
      if (action === 'generate') {
        const result = generateJobOffer(profile);
        await store.save(result.profile);
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Coach job offer').setDescription(`**${result.offer.clubName}** membuka kontrak Coach.`).addFields({ name: 'Offer ID', value: result.offer.id }, { name: 'Salary', value: `${formatMoney(result.offer.salary)}`, inline: true }, { name: 'Target', value: `rank ${result.offer.targetRank}`, inline: true }, { name: 'Duration', value: `${result.offer.durationYears} season`, inline: true })] });
      } else if (action === 'accept') {
        if (!offerId) throw new Error('Masukkan offer_id dari `/coach-job action:list`.');
        const updated = acceptJobOffer(profile, offerId);
        await store.save(updated);
        await interaction.editReply(`Job offer diterima. Coach sekarang memimpin **${updated.coachClubState?.name ?? updated.club}** dengan target **${updated.coach!.boardTarget.type}**.`);
      } else if (action === 'decline') {
        if (!offerId) throw new Error('Masukkan offer_id dari `/coach-job action:list`.');
        const updated = declineJobOffer(profile, offerId);
        await store.save(updated);
        await interaction.editReply(`Job offer **${offerId}** ditolak.`);
      } else {
        if (!profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
        const offers = profile.coach.jobOffers.filter((offer) => offer.status === 'OPEN');
        await interaction.editReply(offers.length ? offers.map((offer) => `**${offer.id}** · ${offer.clubName} · salary ${formatMoney(offer.salary)} · target rank ${offer.targetRank}`).join('\n') : 'Belum ada job offer terbuka. Gunakan `/coach-job action:generate`.');
      }
      return;
    }

    if (command === 'coach-retire') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const updated = retireCoach(profile);
      await store.save(updated);
      await interaction.editReply(`Coach **${updated.coach!.coachName}** resmi pensiun. Legacy honor disimpan; gunakan /coach-rebirth untuk memulai ulang.`);
      return;
    }

    if (command === 'coach-rebirth') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const updated = rebirthCoach(profile);
      await store.save(updated);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Coach rebirth complete').setDescription(formatCoachProfile(updated)).setFooter({ text: 'Bonus rebirth berasal dari honor legacy dan diberi label RECOVERY_INFERRED.' })] });
      return;
    }

    if (command === 'season-end') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = profile.coach?.status === 'EMPLOYED' ? ensureClubState(profile, new Date(), undefined, 'coachClubState') : ensureClubState(profile);
      const clubState = enriched.coach?.status === 'EMPLOYED' ? enriched.coachClubState : enriched.clubState;
      if (clubState?.fixtures.some((fixture) => !fixture.played)) throw new Error('Belum semua fixture selesai. Selesaikan seluruh pertandingan sebelum menutup musim.');
      const updated = enriched.coach?.status === 'EMPLOYED' ? settleCoachSeason(enriched) : finishSeason(enriched);
      await store.save(updated);
      const coachText = updated.coach ? ` Coach board: **${updated.coach.boardTarget.type}**, approval **${updated.coach.approval}/100**, status **${updated.coach.status}**.` : '';
      const seasonClub = updated.coachClubState ?? updated.clubState;
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Season ${updated.league.season - 1} selesai`).setDescription(`Season baru **${updated.league.season}** dimulai. Champions League: **${seasonClub?.championsLeagueQualified ? 'qualified' : 'not qualified'}**.${coachText}`)] });
      return;
    }

    if (command === 'versus-join') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const groupCode = interaction.options.getString('group_code', true).trim().toUpperCase();
      const currentMembers = await versusMembers(store, groupCode);
      const existing = currentMembers.find((member) => member.versus?.season)?.versus?.season;
      if (existing && (existing.currentRound > 1 || existing.battles.some((battle) => battle.state !== 'OPEN'))) throw new Error('Group Versus sudah mengunci season aktif; join baru berlaku pada season berikutnya.');
      if (!currentMembers.some((member) => member.userId === profile.userId) && currentMembers.length >= 8) throw new Error('Group Versus sudah penuh (maksimal 8 user; NPC mengisi slot tersisa).');
      const enrolled = enrollVersus(profile, groupCode);
      await store.save(enrolled);
      const members = await versusMembers(store, groupCode);
      const season = createVersusSeason(groupCode, members);
      await persistVersusSeason(store, season, new Date());
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Versus group joined').setDescription(`Club **${enrolled.versus!.club.name}** bergabung ke group **${groupCode}**.`).addFields({ name: 'Season', value: season.id, inline: true }, { name: 'League clubs', value: `${season.clubs.length}`, inline: true }, { name: 'Round', value: `1/${2 * (season.clubs.length - 1)}`, inline: true }).setFooter({ text: 'Versus memakai aggregate dan wallet terpisah dari Player/Coach.' })] });
      return;
    }

    if (command === 'versus-profile') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.versus) throw new Error('Versus club belum dibuat. Jalankan `/versus-join group_code:<code>`.');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${profile.versus.club.name} · Versus Profile`).setDescription(formatVersusProfile(profile)).addFields({ name: 'Roster', value: `${profile.versus.club.roster.length} players`, inline: true }, { name: 'Group', value: profile.versus.groupCode ?? '-', inline: true }, { name: 'History', value: `${profile.versus.history.length} season`, inline: true })] });
      return;
    }

    if (command === 'versus-standings') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.versus?.groupCode) throw new Error('Versus club belum join group. Jalankan `/versus-join group_code:<code>`.');
      const { season } = await versusSeasonFor(store, profile.versus.groupCode, new Date());
      const standings = getVersusStandings(season);
      const lines = standings.map((standing) => `${standing.rank}. **${standing.clubName}** · ${standing.points} pts · ${standing.wins}-${standing.draws}-${standing.losses} · GD ${standing.goalDifference}${standing.isNpc ? ' · NPC' : ''}`).join('\n');
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Versus Standings · ${season.groupCode}`).setDescription(lines).setFooter({ text: `Round ${season.currentRound}/${2 * (season.clubs.length - 1)} · tie-break: points, goal difference, goals scored, stable club ID.` })] });
      return;
    }

    if (command === 'versus-round') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.versus?.groupCode) throw new Error('Versus club belum join group. Jalankan `/versus-join group_code:<code>`.');
      const groupCode = profile.versus.groupCode;
      const season = await withVersusGroupLock(groupCode, async () => {
        const current = await versusSeasonFor(store, groupCode, new Date());
        const next = processVersusRound(current.season, current.season.currentRound, new Date());
        await persistVersusSeason(store, next, new Date());
        return next;
      });
      const userClubId = profile.versus.clubId;
      const roundId = season.currentRound - 1;
      const battles = season.battles.filter((battle) => battle.roundId === roundId && (battle.homeClubId === userClubId || battle.awayClubId === userClubId));
      const output = battles.map(formatVersusBattle).join('\n\n') || 'Round diproses, tetapi battle user tidak ditemukan.';
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Versus Round ${roundId} settled`).setDescription(output).setFooter({ text: 'Settlement asynchronous, seeded, dan duplicate-guarded per battle ID.' })] });
      return;
    }

    if (command === 'versus-season') {
      const profile = await requireProfile(interaction, store);
      if (!profile?.versus?.groupCode) throw new Error('Versus club belum join group. Jalankan `/versus-join group_code:<code>`.');
      const action = interaction.options.getString('action') ?? 'status';
      const groupCode = profile.versus.groupCode;
      const season = await withVersusGroupLock(groupCode, async () => {
        const current = await versusSeasonFor(store, groupCode, new Date());
        if (action === 'settle') {
          const settled = settleVersusSeason(current.season);
          await persistVersusSeason(store, settled, new Date());
          return settled;
        }
        return current.season;
      });
      const standing = getVersusStandings(season).find((item) => item.clubId === profile.versus!.clubId);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Versus Season · ${season.state}`).setDescription(`Season **${season.id}** · group **${season.groupCode}**\nRound **${Math.min(season.currentRound, 2 * (season.clubs.length - 1) + 1)}/${2 * (season.clubs.length - 1)}** · deadline **${season.roundDeadline}**`).addFields({ name: 'Your standing', value: standing ? `rank ${standing.rank} · ${standing.points} points · ${standing.wins}-${standing.draws}-${standing.losses}` : '-', inline: true }, { name: 'Rewards', value: season.state === 'FINISHED' ? `${season.rewards.find((item) => item.clubId === profile.versus!.clubId)?.money ?? 0} money · ${season.rewards.find((item) => item.clubId === profile.versus!.clubId)?.coin ?? 0} coin` : 'Belum dibagikan', inline: true })] });
      return;
    }

    if (command === 'daily') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const result = claimDailyReward(profile);
      await store.save(result.profile);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Daily reward claimed').setDescription(`Anda menerima **${formatMoney(result.amount)} money** dan **${result.exp} EXP**.`).addFields({ name: 'Streak', value: `${result.streak} hari`, inline: true }, { name: 'Balance', value: formatMoney(result.profile.money), inline: true })] });
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
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${result.profile.event!.title} · Resolved`).setDescription(`Pilihan: **${result.choice.label}**\nReward: **${result.choice.rewardMoney} money** dan **${result.choice.rewardExp} EXP**.`)] });
      } else {
        await store.save(enriched);
        const event = enriched.event!;
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(event.title).setDescription(`${event.description}\n\n${event.choices.map((choice) => `**${choice.id}** — ${choice.label} (cost ${choice.cost}, reward ${choice.rewardMoney} money / ${choice.rewardExp} EXP)`).join('\n')}`).setFooter({ text: 'Pilih dengan /event choice:<id>' })] });
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
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Transfer Market').setDescription(listings || 'Market kosong. Gunakan action refresh.') .setFooter({ text: 'Gunakan /buy-player listing:<id> untuk membeli.' })] });
      return;
    }

    if (command === 'buy-player') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const listingId = interaction.options.getString('listing', true);
      const result = buyMarketPlayer(profile, listingId);
      await store.save(result.profile);
      await interaction.editReply(`Transfer berhasil: **${result.listing.player.name}** bergabung dengan klub untuk **${formatMoney(result.listing.price)}**.`);
      return;
    }

    if (command === 'sell-player') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const playerId = interaction.options.getString('player', true);
      const result = sellClubPlayer(profile, playerId);
      await store.save(result.profile);
      await interaction.editReply(`**${result.player.name}** dijual dengan harga **${formatMoney(result.price)}**.`);
      return;
    }

    if (command === 'contract') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'view';
      const current = getContractStatus(profile);
      if (action === 'sign') {
        if (current?.state === 'ACTIVE') throw new Error('Kontrak masih aktif.');
        const updated = current?.state === 'EXPIRED' ? renewContract(profile) : signContract(profile);
        await store.save(updated);
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Contract updated').setDescription(formatContract(updated.contract))] });
      } else {
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Player contract').setDescription(formatContract(current))] });
      }
      return;
    }

    if (command === 'champions') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const action = interaction.options.getString('action') ?? 'status';
      if (action === 'play') {
        const result = playChampionsLeague(profile);
        await store.save(result.profile);
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`Champions League · ${result.status}`).setDescription(result.commentary.join('\\n')).addFields({ name: 'Reward state', value: result.status === 'CHAMPION' ? 'Club assets and prestige increased.' : 'Continue the competition from the next round.', inline: true })] });
      } else {
        const enriched = startChampionsLeague(profile);
        await store.save(enriched);
        const state = enriched.championsLeague!;
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Champions League · Status').setDescription(`Status **${state.status}**\nRound **${state.round}**\nOpponent **${state.opponent}**\nAggregate **${state.aggregate}**`).setFooter({ text: 'Gunakan /champions action:play untuk memainkan ronde.' })] });
      }
      return;
    }

    if (command === 'achievements') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const enriched = syncAchievements(profile);
      await store.save(enriched);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Achievements').setDescription(formatAchievements(enriched))] });
      return;
    }

    if (command === 'claim-achievement') {
      const profile = await requireProfile(interaction, store);
      if (!profile) return;
      const achievementId = interaction.options.getString('achievement', true);
      const result = claimAchievement(profile, achievementId);
      await store.save(result.profile);
      await interaction.editReply(`Achievement **${result.achievement.title}** diklaim: **${formatMoney(result.achievement.rewardMoney)} money** dan **${result.achievement.rewardExp} EXP**.`);
      return;
    }

    if (command === 'admin') {
      if (!ADMIN_USER_IDS.has(interaction.user.id)) throw new Error('Anda tidak memiliki akses admin.');
      const action = interaction.options.getString('action', true);
      const profiles = await store.all();
      if (action === 'stats') {
        const averageLevel = profiles.length ? profiles.reduce((sum, profile) => sum + profile.level, 0) / profiles.length : 0;
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Bot Operations').setDescription(`Profiles **${profiles.length}**\nAverage player level **${averageLevel.toFixed(2)}**\nPersistence **${process.env.DATABASE_URL ? 'PostgreSQL' : 'JSON'}**\nNode environment **${process.env.NODE_ENV ?? 'development'}**`)] });
      } else if (action === 'refresh-markets') {
        for (const profile of profiles) await store.save(refreshMarket(profile, new Date(), true));
        await interaction.editReply(`Market refreshed untuk **${profiles.length}** profile(s).`);
      }
      return;
    }

    if (command === 'help') {
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('Football Rising Star — Panduan').setDescription('Bangun karier pemain dan kelola klub melalui loop mingguan yang terinspirasi dari gameplay publik dan client recovery. Formula yang belum memiliki method body resmi tetap diberi label RECOVERY_INFERRED.').addFields({ name: 'Player Mode', value: '`/start`, `/profile`, `/skills`, `/train-skill`, `/assign-exp`, `/match`, `/next-week`, `/league`' }, { name: 'Player progression', value: '`/injury`, `/trick`, `/trainer`, `/culture`, `/honors`, `/world-footballer`, `/retire`, `/rebirth`' }, { name: 'Coach Mode', value: '`/coach-career`, `/coach-profile`, `/coach-round`, `/coach-exp`, `/coach-event`, `/coach-job`, `/coach-retire`, `/coach-rebirth`' }, { name: 'Versus Mode', value: '`/versus-join`, `/versus-profile`, `/versus-round`, `/versus-standings`, `/versus-season` — asynchronous group league terpisah' }, { name: 'Club & economy', value: '`/club`, `/squad`, `/formation`, `/tactic`, `/club-match`, `/standings`, `/season-end`, `/daily`, `/event`, `/market`, `/buy-player`, `/sell-player`, `/contract`' })] });
      return;
    }

    await interaction.editReply({ content: 'Command belum dikenali.' });
  } catch (error) {
    log('error', 'command_failed', { command, userId: interaction.user.id, error });
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.';
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: message, ephemeral: true });
    else await interaction.editReply({ content: message });
  }
}


function componentOwner(customId: string, userId: string): string {
  const [namespace, ownerId, action] = customId.split(':');
  if (namespace !== 'frs' || ownerId !== userId || !action) throw new Error('Komponen ini bukan milik profile Anda. Jalankan command dari profile Anda sendiri.');
  return action;
}

export async function handleComponent(interaction: ButtonInteraction | StringSelectMenuInteraction, store: PlayerStore): Promise<void> {
  try {
    const action = componentOwner(interaction.customId, interaction.user.id);
    await interaction.deferReply({ ephemeral: true });
    const profile = await store.get(interaction.user.id);
    if (!profile) throw new Error('Profil belum dibuat. Jalankan `/start position:<GK|DF|MF|FW>` terlebih dahulu.');

    if (action === 'coach-profile') {
      if (!profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start`.');
      await interaction.editReply({ content: formatCoachProfile(profile), components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'versus-profile') {
      if (!profile.versus) throw new Error('Versus club belum dibuat. Jalankan `/versus-join group_code:<code>`.');
      await interaction.editReply({ content: formatVersusProfile(profile), components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'profile') {
      const enriched = ensureClubState(recoverPlayer(profile));
      await store.save(enriched);
      await interaction.editReply({ embeds: [profileEmbed(enriched)], components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'skills') {
      const enriched = ensureGameplayState(profile);
      await store.save(enriched);
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${enriched.displayName} · Detailed Skills`).setDescription(formatDetailedSkills(enriched)).addFields({ name: 'Gameplay state', value: formatGameplayStatus(enriched) })], components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'next-week') {
      const result = advanceWeek(profile);
      await store.save(result.profile);
      await interaction.editReply({ content: `Week ${result.week} selesai.\\n${result.narrative.join('\\n')}\\nPending EXP: ${result.expAwaitingAssignment}.`, components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'train') {
      await interaction.editReply({ content: 'Pilih macro ability atau gunakan detailed skill selector.', components: trainingControls(interaction.user.id) });
      return;
    }

    if (action === 'detailed-train') {
      await interaction.editReply({ content: 'Pilih detailed skill yang ingin dilatih.', components: detailedTrainingControls(interaction.user.id) });
      return;
    }

    if (action === 'train-select' && interaction.isStringSelectMenu()) {
      const ability = interaction.values[0] as AbilityId;
      const result = trainPlayer(profile, ability);
      await store.save(result.profile);
      await interaction.editReply({ content: `**${formatAbility(result.ability)}** naik dari **${result.statBefore}** menjadi **${result.statAfter}**. EXP: **${result.expGained}**.`, components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'detailed-train-select' && interaction.isStringSelectMenu()) {
      const skill = interaction.values[0] as DetailedSkillId;
      const result = trainDetailedSkill(profile, skill);
      await store.save(result.profile);
      await interaction.editReply({ content: `**${DETAILED_SKILL_LABELS[result.skill]}** naik dari Lv ${result.levelBefore} menjadi **${result.levelAfter}**. EXP: **${result.expGained}**.`, components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'match') {
      const result = playMatch(profile);
      await store.save(result.profile);
      const outcomeLabel = result.record.outcome === 'WIN' ? 'VICTORY' : result.record.outcome === 'DRAW' ? 'DRAW' : 'DEFEAT';
      await interaction.editReply({ content: `**${outcomeLabel}** · ${result.profile.club} ${result.record.playerGoals}–${result.record.opponentGoals} ${result.record.opponent}\n${result.narrative.join('\n')}\nReward: ${formatMoney(result.record.rewards.money)} money / ${result.record.rewards.exp} EXP.`, components: careerControls(interaction.user.id) });
      return;
    }

    if (action === 'club') {
      const enriched = ensureClubState(profile);
      await store.save(enriched);
      const club = enriched.clubState!;
      await interaction.editReply({ content: `**${club.name} · Club Office**\nRating ${getClubRating(enriched)} · Level ${club.level}\nFormation ${club.formation} · Tactic ${TACTICS[club.tactic].name}\nPrestige ${club.prestige} · Assets ${formatMoney(club.assets)}`, components: careerControls(interaction.user.id) });
      return;
    }

    throw new Error('Aksi komponen tidak dikenali.');
  } catch (error) {
    log('error', 'component_failed', { component: interaction.customId, userId: interaction.user.id, error });
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.';
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: message, ephemeral: true });
    else await interaction.reply({ content: message, ephemeral: true });
  }
}
