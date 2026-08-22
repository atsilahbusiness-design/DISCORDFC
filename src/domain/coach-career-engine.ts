import { RECOVERY_CLUBS } from '../config/recovery-data.js';
import { GAME_BALANCE } from '../config/game-balance.js';
import { ensureClubState, finishSeason, playClubMatch, projectCoachLeagueStandings } from './club-engine.js';
import { MathRandomSource, type RandomSource } from './engine.js';
import {
  COACH_ABILITIES,
  COACH_ABILITY_LABELS,
  type AbilityState,
  type CoachAbilityId,
  type CoachBoardTarget,
  type CoachCareerState,
  type CoachEvent,
  type CoachEventChoice,
  type CoachExpAllocationResult,
  type CoachJobOffer,
  type CoachRoundResult,
  type CoachTargetType,
  type HonorRecord,
  type PlayerProfile
} from './types.js';

const WEEK_MS = 7 * 86_400_000;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function nextAbilityExp(level: number): number {
  return Math.max(100, level * 100);
}

function defaultCoachAbilities(): Record<CoachAbilityId, AbilityState> {
  return Object.fromEntries(COACH_ABILITIES.map((id) => [id, { level: 1, exp: 0 }])) as Record<CoachAbilityId, AbilityState>;
}

function coachOrThrow(profile: PlayerProfile): CoachCareerState {
  if (!profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start` terlebih dahulu.');
  return profile.coach;
}

function ensureCoachClubState(profileInput: PlayerProfile, now: Date, rng?: RandomSource): PlayerProfile {
  return ensureClubState(profileInput, now, rng, 'coachClubState');
}

function coachClubName(profile: PlayerProfile): string {
  return profile.coachClubState?.name ?? profile.club;
}

function currentClubRecord(profile: PlayerProfile) {
  return RECOVERY_CLUBS.find((club) => club.nameEn === coachClubName(profile));
}

function currentRank(profile: PlayerProfile): number {
  const club = profile.coachClubState;
  if (!club) return 1;
  const standings = [...club.standings].sort((a, b) => {
    const points = b.points - a.points;
    if (points !== 0) return points;
    const goalDifference = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    if (goalDifference !== 0) return goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  return Math.max(1, standings.findIndex((standing) => standing.clubId === club.id) + 1);
}

function targetFor(profile: PlayerProfile, season = profile.coach?.season ?? profile.league.season): CoachBoardTarget {
  const tier = profile.coachClubState?.leagueTier ?? 1;
  let type: CoachTargetType;
  let targetRank: number;
  if (tier <= 1) {
    type = 'CHAMPIONSHIP';
    targetRank = 1;
  } else if (tier >= 4) {
    type = 'AVOID_RELEGATION';
    targetRank = Math.max(8, Math.ceil((profile.coachClubState?.standings.length ?? 20) * 0.7));
  } else {
    type = 'PROMOTION';
    targetRank = 3;
  }
  return {
    type,
    season,
    targetRank,
    progressRank: currentRank(profile),
    approvalDeltaOnSuccess: type === 'CHAMPIONSHIP' ? 10 : 8,
    approvalDeltaOnFailure: type === 'AVOID_RELEGATION' ? -10 : -8,
    rewardMoney: type === 'CHAMPIONSHIP' ? 5_000 : 2_500,
    resolved: false
  };
}

function coachExpFor(outcome: 'WIN' | 'DRAW' | 'LOSS', level: number, rng: RandomSource): number {
  const base = outcome === 'WIN' ? GAME_BALANCE.coach.roundExp.win : outcome === 'DRAW' ? GAME_BALANCE.coach.roundExp.draw : GAME_BALANCE.coach.roundExp.loss;
  return base + level * GAME_BALANCE.coach.levelExpBonus + Math.floor(rng.next() * GAME_BALANCE.coach.varianceMaxExclusive);
}

function approvalForRound(profile: PlayerProfile, outcome: 'WIN' | 'DRAW' | 'LOSS', target: CoachBoardTarget): number {
  const base = outcome === 'WIN' ? 2 : outcome === 'DRAW' ? 0 : -2;
  const tacticalBonus = Math.floor((profile.coach?.abilities.stateAdjustment.level ?? 1) / 4);
  const rank = target.progressRank ?? currentRank(profile);
  const targetBonus = rank <= target.targetRank ? 1 : 0;
  return base + tacticalBonus + targetBonus;
}

function eventTemplate(templateId: CoachEvent['templateId']): { title: string; description: string; choices: CoachEventChoice[] } {
  const templates: Record<CoachEvent['templateId'], { title: string; description: string; choices: CoachEventChoice[] }> = {
    'press-criticism': {
      title: 'Press criticism',
      description: 'Media mempertanyakan keputusan taktik dan hasil terakhir tim.',
      choices: [
        { id: 'answer-confidently', label: 'Jawab dengan tegas', description: 'Menggunakan karisma untuk menjaga narasi publik.', approvalDelta: 2, moneyDelta: 0, expDelta: 20, ability: 'charisma' },
        { id: 'ignore-press', label: 'Abaikan media', description: 'Fokus pada latihan, tetapi tekanan publik meningkat.', approvalDelta: -2, moneyDelta: 0, expDelta: 8 }
      ]
    },
    'locker-room-speech': {
      title: 'Locker-room speech',
      description: 'Ruang ganti membutuhkan arahan sebelum round penting.',
      choices: [
        { id: 'rally-squad', label: 'Pidato motivasi', description: 'Menaikkan kepercayaan dan cohesion skuad.', approvalDelta: 3, moneyDelta: 0, expDelta: 22, ability: 'lockerRoom' },
        { id: 'keep-message-short', label: 'Pesan singkat dan disiplin', description: 'Stabil, tetapi tidak menghasilkan momentum besar.', approvalDelta: 1, moneyDelta: 0, expDelta: 12, ability: 'stateAdjustment' }
      ]
    },
    'team-building': {
      title: 'Team building',
      description: 'Pemain meminta kegiatan bersama untuk memperbaiki chemistry.',
      choices: [
        { id: 'fund-team-dinner', label: 'Biayai team dinner', description: 'Menggunakan aset klub untuk membangun chemistry.', approvalDelta: 3, moneyDelta: -120, expDelta: 25, ability: 'lockerRoom' },
        { id: 'skip-team-building', label: 'Lewati kegiatan', description: 'Menghemat aset tetapi menjaga jarak antar pemain.', approvalDelta: -1, moneyDelta: 0, expDelta: 5 }
      ]
    },
    'player-discipline': {
      title: 'Player discipline',
      description: 'Seorang pemain inti melanggar aturan internal menjelang pertandingan.',
      choices: [
        { id: 'issue-fine', label: 'Berikan denda', description: 'Menegakkan aturan secara terbuka.', approvalDelta: 1, moneyDelta: 80, expDelta: 18, ability: 'stateAdjustment' },
        { id: 'private-conversation', label: 'Bicara empat mata', description: 'Menjaga hubungan dan memberi kesempatan memperbaiki diri.', approvalDelta: 2, moneyDelta: 0, expDelta: 24, ability: 'charisma' }
      ]
    },
    'financial-crisis': {
      title: 'Financial crisis',
      description: 'Cash-flow klub menurun dan bonus pertandingan harus ditinjau ulang.',
      choices: [
        { id: 'cut-bonuses', label: 'Potong bonus sementara', description: 'Aset bertambah, tetapi moral ruang ganti berisiko turun.', approvalDelta: -3, moneyDelta: 300, expDelta: 16 },
        { id: 'invest-reserves', label: 'Gunakan cadangan klub', description: 'Membeli stabilitas jangka pendek dengan biaya aset.', approvalDelta: 4, moneyDelta: -300, expDelta: 24, ability: 'charisma' }
      ]
    }
  };
  return clone(templates[templateId]);
}

function makeCoachEvent(profile: PlayerProfile, rng: RandomSource, now: Date): CoachEvent | undefined {
  if (profile.coach?.event && !profile.coach.event.resolved) return profile.coach.event;
  if (rng.next() >= GAME_BALANCE.coach.eventChance) return undefined;
  const ids: CoachEvent['templateId'][] = ['press-criticism', 'locker-room-speech', 'team-building', 'player-discipline', 'financial-crisis'];
  const templateId = ids[Math.floor(rng.next() * ids.length)];
  const template = eventTemplate(templateId);
  return {
    id: `coach-event-${profile.coach?.season ?? 1}-${profile.coachClubState?.fixtures.filter((fixture) => fixture.played).length ?? 0}-${templateId}`,
    templateId,
    title: template.title,
    description: template.description,
    choices: template.choices,
    resolved: false,
    createdAt: now.toISOString()
  };
}

export function createCoachCareer(profileInput: PlayerProfile, coachName = profileInput.displayName, now = new Date(), rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const profile = ensureCoachClubState(profileInput, now, rng);
  if (profile.coach) return profile;
  const club = currentClubRecord(profile);
  const coach: CoachCareerState = {
    coachName,
    age: GAME_BALANCE.coach.initialAge,
    level: 1,
    totalExp: 0,
    salary: club?.coachSalaryBase ?? 1_000,
    unassignedExp: 0,
    abilities: defaultCoachAbilities(),
    approval: GAME_BALANCE.coach.initialApproval,
    status: 'EMPLOYED',
    careerYear: 1,
    season: 1,
    boardTarget: targetFor(profile, 1),
    jobOffers: [],
    honors: []
  };
  profile.coach = coach;
  profile.updatedAt = now.toISOString();
  return profile;
}

export function advanceCoachRound(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): CoachRoundResult {
  const prepared = ensureCoachClubState(profileInput, now, rng);
  const coach = coachOrThrow(prepared);
  if (coach.status !== 'EMPLOYED') throw new Error('Coach tidak sedang terikat kontrak dengan club. Terima job offer terlebih dahulu.');
  if (coach.event && !coach.event.resolved) throw new Error('Selesaikan Coach event terlebih dahulu dengan `/coach-event`.');
  if (!prepared.coachClubState?.fixtures.some((fixture) => !fixture.played)) throw new Error('Season Coach sudah selesai. Gunakan `/season-end` untuk memulai season berikutnya.');
  const match = playClubMatch(prepared, now, rng, 'coachClubState');
  const profile = match.profile;
  const updatedCoach = clone(coachOrThrow(profile));
  const exp = coachExpFor(match.outcome, updatedCoach.level, rng);
  updatedCoach.totalExp += exp;
  updatedCoach.unassignedExp += exp;
  const target = clone(updatedCoach.boardTarget);
  target.progressRank = currentRank(profile);
  const approvalDelta = approvalForRound(profile, match.outcome, target);
  updatedCoach.approval = clamp(updatedCoach.approval + approvalDelta, 0, 100);
  updatedCoach.boardTarget = target;
  const event = makeCoachEvent(profile, rng, now);
  if (event) updatedCoach.event = event;
  profile.coach = updatedCoach;
  profile.updatedAt = now.toISOString();
  return {
    profile,
    match,
    coachExp: exp,
    approvalDelta,
    boardTarget: clone(target),
    seasonComplete: !profile.coachClubState?.fixtures.some((fixture) => !fixture.played),
    event: event ? clone(event) : undefined
  };
}

export function assignCoachExp(profileInput: PlayerProfile, allocations: Partial<Record<CoachAbilityId, number>>, now = new Date()): CoachExpAllocationResult {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  if (coach.status === 'RETIRED') throw new Error('Coach yang sudah pensiun tidak dapat menerima EXP. Gunakan `/coach-rebirth`.');
  const total = Object.values(allocations).reduce((sum, value) => sum + (value ?? 0), 0);
  if (!Number.isInteger(total) || total <= 0) throw new Error('Alokasi EXP Coach harus bilangan bulat lebih besar dari 0.');
  if (total > coach.unassignedExp) throw new Error(`EXP Coach tidak cukup. Tersedia ${coach.unassignedExp}.`);
  let levelsGained = 0;
  for (const [id, amount] of Object.entries(allocations) as Array<[CoachAbilityId, number | undefined]>) {
    if (amount === undefined || amount === 0) continue;
    if (!COACH_ABILITIES.includes(id)) throw new Error(`Coach ability tidak dikenal: ${id}.`);
    if (!Number.isInteger(amount) || amount < 0) throw new Error('Alokasi EXP tidak boleh pecahan atau negatif.');
    const state = coach.abilities[id];
    state.exp += amount;
    while (state.exp >= nextAbilityExp(state.level)) {
      state.exp -= nextAbilityExp(state.level);
      state.level += 1;
      levelsGained += 1;
    }
  }
  coach.unassignedExp -= total;
  coach.level = Math.max(...COACH_ABILITIES.map((id) => coach.abilities[id].level));
  profile.updatedAt = now.toISOString();
  return { profile, allocated: total, remaining: coach.unassignedExp, levelsGained };
}

export function generateJobOffer(profileInput: PlayerProfile, rng: RandomSource = new MathRandomSource()): { profile: PlayerProfile; offer: CoachJobOffer } {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  if (coach.status === 'RETIRED') throw new Error('Coach yang sudah pensiun tidak dapat mencari job baru.');
  const current = currentClubRecord(profile);
  const currentLeague = current?.league ?? 1011;
  const sameLeague = RECOVERY_CLUBS.filter((club) => club.league === currentLeague && club.nameEn !== current?.nameEn)
    .filter((club) => !coach.jobOffers.some((offer) => offer.status === 'OPEN' && offer.clubId === String(club.id)));
  const candidates = sameLeague.length > 0 ? sameLeague : RECOVERY_CLUBS.filter((club) => club.league === 1011 && club.nameEn !== current?.nameEn)
    .filter((club) => !coach.jobOffers.some((offer) => offer.status === 'OPEN' && offer.clubId === String(club.id)));
  if (candidates.length === 0) throw new Error('Belum ada club lain yang membuka lowongan.');
  const club = candidates[Math.floor(rng.next() * candidates.length)];
  const targetRank = club.grade >= 4 ? 1 : club.grade >= 2 ? 3 : 12;
  const offer: CoachJobOffer = {
    id: `coach-job-${club.id}-${coach.level}-${coach.jobOffers.length + 1}`,
    clubId: String(club.id),
    clubName: club.nameEn,
    league: club.league,
    salary: Math.max(500, club.coachSalaryBase + coach.level * 75),
    targetRank,
    durationYears: 1,
    status: 'OPEN'
  };
  coach.jobOffers = [...coach.jobOffers, offer].slice(-5);
  profile.updatedAt = new Date().toISOString();
  return { profile, offer: clone(offer) };
}

export function declineJobOffer(profileInput: PlayerProfile, offerId: string): PlayerProfile {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  const offer = coach.jobOffers.find((item) => item.id === offerId && item.status === 'OPEN');
  if (!offer) throw new Error('Job offer tidak ditemukan atau sudah ditutup.');
  offer.status = 'DECLINED';
  profile.updatedAt = new Date().toISOString();
  return profile;
}

export function acceptJobOffer(profileInput: PlayerProfile, offerId: string, now = new Date(), rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  if (coach.status === 'RETIRED') throw new Error('Coach yang sudah pensiun tidak dapat menerima job offer. Gunakan `/coach-rebirth`.');
  const offer = coach.jobOffers.find((item) => item.id === offerId && item.status === 'OPEN');
  if (!offer) throw new Error('Job offer tidak ditemukan atau sudah ditutup.');
  offer.status = 'ACCEPTED';
  const nextCoachSeason = coach.season + 1;
  delete profile.coachClubState;
  const seed = { ...profile, club: offer.clubName, league: { ...profile.league, season: nextCoachSeason, matchday: 1, points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 } };
  const rebuiltState = ensureClubState(seed, now, rng, 'coachClubState');
  profile.coachClubState = rebuiltState.coachClubState;
  const rebuilt = profile;
  const updatedCoach = coachOrThrow(rebuilt);
  updatedCoach.status = 'EMPLOYED';
  updatedCoach.salary = offer.salary;
  updatedCoach.careerYear += 1;
  updatedCoach.season = nextCoachSeason;
  updatedCoach.boardTarget = targetFor(rebuilt, updatedCoach.season);
  updatedCoach.event = undefined;
  rebuilt.updatedAt = now.toISOString();
  return rebuilt;
}

export function resolveCoachEvent(profileInput: PlayerProfile, choiceId: string, now = new Date()): PlayerProfile {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  if (coach.status !== 'EMPLOYED') throw new Error('Coach tidak sedang employed sehingga event tidak dapat diselesaikan.');
  const event = coach.event;
  if (!event || event.resolved) throw new Error('Tidak ada Coach event yang menunggu keputusan.');
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error('Pilihan event Coach tidak ditemukan.');
  coach.approval = clamp(coach.approval + choice.approvalDelta, 0, 100);
  if (profile.coachClubState) profile.coachClubState.assets = Math.max(0, profile.coachClubState.assets + choice.moneyDelta);
  coach.totalExp += choice.expDelta;
  coach.unassignedExp += choice.expDelta;
  if (choice.ability) {
    const state = coach.abilities[choice.ability];
    state.exp += Math.max(0, Math.floor(choice.expDelta / 2));
    while (state.exp >= nextAbilityExp(state.level)) {
      state.exp -= nextAbilityExp(state.level);
      state.level += 1;
    }
    coach.level = Math.max(coach.level, ...COACH_ABILITIES.map((id) => coach.abilities[id].level));
  }
  event.resolved = true;
  profile.updatedAt = now.toISOString();
  return profile;
}

export function settleCoachSeason(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const snapshot = ensureCoachClubState(profileInput, now, rng);
  const coach = coachOrThrow(snapshot);
  if (coach.status !== 'EMPLOYED') throw new Error('Coach tidak sedang employed sehingga season tidak dapat diselesaikan.');
  if (snapshot.coachClubState?.fixtures.some((fixture) => !fixture.played)) throw new Error('Belum semua fixture Coach selesai.');
  if (snapshot.coachClubState) projectCoachLeagueStandings(snapshot.coachClubState);
  const rank = currentRank(snapshot);
  const target = clone(coach.boardTarget);
  target.progressRank = rank;
  target.resolved = true;
  const success = rank <= target.targetRank;
  coach.approval = clamp(coach.approval + (success ? target.approvalDeltaOnSuccess : target.approvalDeltaOnFailure), 0, 100);
  if (success) {
    if (snapshot.coachClubState) snapshot.coachClubState.assets += target.rewardMoney;
    const honor: HonorRecord = {
      id: `coach-board-${snapshot.userId}-${coach.season}-${target.type}`,
      category: 'TEAM',
      title: `${target.type} · ${coachClubName(snapshot)}`,
      season: coach.season,
      description: `Board target selesai pada rank ${rank}; reward ${target.rewardMoney} money.`,
      source: 'RECOVERY_INFERRED',
      value: target.rewardMoney,
      awardedAt: now.toISOString()
    };
    coach.honors = [...coach.honors, honor];
  }
  const playerLeague = clone(snapshot.league);
  const coachSeasonInput = { ...snapshot, league: { ...snapshot.league, season: coach.season } };
  const updated = finishSeason(coachSeasonInput, now, 'coachClubState', rng);
  updated.league = playerLeague;
  const nextCoach = coachOrThrow(updated);
  nextCoach.careerYear += 1;
  nextCoach.age += 1;
  nextCoach.season = coach.season + 1;
  nextCoach.status = nextCoach.approval < 20 ? 'UNEMPLOYED' : 'EMPLOYED';
  nextCoach.boardTarget = targetFor(updated, nextCoach.season);
  nextCoach.championsLeague = undefined;
  nextCoach.event = undefined;
  updated.updatedAt = now.toISOString();
  return updated;
}

export function retireCoach(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = clone(profileInput);
  const coach = coachOrThrow(profile);
  if (coach.status === 'RETIRED') throw new Error('Coach sudah pensiun.');
  const honor: HonorRecord = {
    id: `coach-retirement-${profile.userId}-${coach.careerYear}`,
    category: 'PERSONAL',
    title: `${coach.coachName} — Coach Legacy`,
    season: coach.season,
    description: `Pensiun setelah ${coach.careerYear} tahun karier dengan approval ${coach.approval}.`,
    source: 'RECOVERY_INFERRED',
    value: coach.level,
    awardedAt: now.toISOString()
  };
  coach.honors = [...coach.honors, honor];
  coach.status = 'RETIRED';
  coach.retiredAt = now.toISOString();
  profile.updatedAt = now.toISOString();
  return profile;
}

export function rebirthCoach(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = clone(profileInput);
  const oldCoach = coachOrThrow(profile);
  if (oldCoach.status !== 'RETIRED') throw new Error('Coach harus pensiun sebelum rebirth.');
  const honors = clone(oldCoach.honors);
  const bonusLevels = Math.min(3, Math.floor(honors.length / 2));
  const previousCoachClub = coachClubName(profile);
  delete profile.coachClubState;
  const seed = { ...profile, club: previousCoachClub };
  const rebuiltState = ensureClubState(seed, now, new MathRandomSource(), 'coachClubState');
  profile.coachClubState = rebuiltState.coachClubState;
  const abilities = defaultCoachAbilities();
  for (const id of COACH_ABILITIES) abilities[id].level += bonusLevels;
  profile.coach = {
    coachName: oldCoach.coachName,
    age: GAME_BALANCE.coach.initialAge,
    level: 1 + bonusLevels,
    salary: currentClubRecord(profile)?.coachSalaryBase ?? 1_000,
    totalExp: 0,
    unassignedExp: 0,
    abilities,
    approval: GAME_BALANCE.coach.initialApproval,
    status: 'EMPLOYED',
    careerYear: 1,
    season: oldCoach.season + 1,
    boardTarget: targetFor(profile, oldCoach.season + 1),
    jobOffers: [],
    honors
  };
  profile.updatedAt = now.toISOString();
  return profile;
}

export function formatCoachProfile(profileInput: PlayerProfile): string {
  const coach = coachOrThrow(profileInput);
  const abilities = COACH_ABILITIES.map((id) => `${COACH_ABILITY_LABELS[id]} Lv ${coach.abilities[id].level} (${coach.abilities[id].exp} EXP)`).join('\n');
  const target = coach.boardTarget;
  return `**${coach.coachName}** · age ${coach.age} · level ${coach.level}\nStatus **${coach.status}** · approval **${coach.approval}/100** · salary **${coach.salary}**\nUnassigned Coach EXP **${coach.unassignedExp}**\n\n${abilities}\n\nBoard target **${target.type}** · target rank **${target.targetRank}** · current rank **${target.progressRank ?? '-'}**`;
}

export function getCoachNextRoundAt(profileInput: PlayerProfile, now = new Date()): Date | undefined {
  const coach = coachOrThrow(profileInput);
  if (coach.status !== 'EMPLOYED') return undefined;
  const fixture = profileInput.coachClubState?.fixtures.find((item) => !item.played);
  return fixture?.playedAt ? new Date(fixture.playedAt) : new Date(now.getTime() + WEEK_MS);
}
