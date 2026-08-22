import { createInitialProfile, getRating, MathRandomSource, type RandomSource } from './engine.js';
import { FORMATIONS, TACTICS, type ClubFixture, type ClubMatchResult, type ClubPlayer, type ClubState, type FormationId, type MatchOutcome, type PlayerProfile, type Position, type TacticId } from './types.js';
import { SEED_CLUB_NAMES, SEED_PLAYER_NAMES, SEED_ROSTER_POSITIONS } from '../config/seed-data.js';
import { RECOVERY_CLUBS, RECOVERY_PLAYERS_BY_CLUB, type RecoveryPlayerRecord } from '../config/recovery-data.js';
import { GAME_BALANCE } from '../config/game-balance.js';

const RECOVERY_PRIMARY_CLUB_NAMES = RECOVERY_CLUBS.filter((club) => club.league === 1011).map((club) => club.nameEn);
const CLUB_NAMES = RECOVERY_PRIMARY_CLUB_NAMES.length >= 10 ? RECOVERY_PRIMARY_CLUB_NAMES : SEED_CLUB_NAMES;
const POSITIONS: Position[] = SEED_ROSTER_POSITIONS;
const PLAYER_NAMES = SEED_PLAYER_NAMES;
type ClubStateField = 'clubState' | 'coachClubState';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function userAsClubPlayer(profile: PlayerProfile, now: Date): ClubPlayer {
  return {
    id: `user-${profile.userId}`,
    name: profile.displayName,
    position: profile.position,
    age: profile.age,
    overall: getRating(profile),
    stats: structuredClone(profile.stats),
    morale: 85,
    hp: profile.hp,
    maxHp: profile.maxHp,
    salary: 0,
    contractUntil: new Date(now.getTime() + 365 * 86_400_000).toISOString(),
    isUserPlayer: true,
    goals: profile.career.goals,
    assists: profile.career.assists,
    appearances: profile.career.appearances
  };
}

function recoveryPosition(code: number): Position {
  if (code === 13) return 'GK';
  if (code >= 10 && code <= 12) return 'DF';
  if (code >= 5 && code <= 9) return 'MF';
  return 'FW';
}

function recoveryOverall(record: RecoveryPlayerRecord): number {
  return clamp(52 + Math.abs(record.normalValue % 38), 45, 92);
}

function recoveryClubPlayer(record: RecoveryPlayerRecord, level: number, now: Date): ClubPlayer {
  const overall = recoveryOverall(record);
  const position = recoveryPosition(record.positionCode);
  const stats = {
    atk: clamp(overall + (position === 'FW' ? 8 : 0), 20, 99),
    def: clamp(overall + (position === 'DF' || position === 'GK' ? 8 : 0), 20, 99),
    speed: clamp(overall + (position === 'FW' || position === 'MF' ? 5 : 0), 20, 99),
    power: clamp(overall + 1, 20, 99),
    strength: clamp(overall + (position === 'DF' ? 5 : 0), 20, 99),
    technique: clamp(overall + (position === 'MF' ? 7 : 0), 20, 99)
  };
  return {
    id: `recovery-${record.clubId}-${record.num}-${record.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: record.nameEn,
    position,
    age: record.initAge,
    overall,
    stats,
    morale: 75,
    hp: 100,
    maxHp: 100,
    salary: Math.max(40, Math.round(record.price + level * 10)),
    contractUntil: new Date(now.getTime() + 180 * 86_400_000).toISOString(),
    isUserPlayer: false,
    goals: 0,
    assists: 0,
    appearances: 0
  };
}

function npcPlayer(index: number, level: number, rng: RandomSource, now: Date): ClubPlayer {
  const position = POSITIONS[index % POSITIONS.length];
  const base = 45 + level * 2 + Math.floor(rng.next() * 14);
  const stats = {
    atk: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95),
    def: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95),
    speed: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95),
    power: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95),
    strength: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95),
    technique: clamp(base + Math.floor(rng.next() * 18) - 5, 20, 95)
  };
  const overall = Math.round((stats.atk + stats.def + stats.speed + stats.power + stats.strength + stats.technique) / 6);
  return {
    id: `npc-${index + 1}`,
    name: PLAYER_NAMES[index % PLAYER_NAMES.length],
    position,
    age: 18 + Math.floor(rng.next() * 15),
    overall,
    stats,
    morale: 65 + Math.floor(rng.next() * 30),
    hp: 100,
    maxHp: 100,
    salary: 50 + level * 15 + Math.floor(rng.next() * 50),
    contractUntil: new Date(now.getTime() + 180 * 86_400_000).toISOString(),
    isUserPlayer: false,
    goals: 0,
    assists: 0,
    appearances: 0
  };
}

function recoveredFormation(officialClub: typeof RECOVERY_CLUBS[number] | undefined): FormationId {
  const formationIds: FormationId[] = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-1-3-2', '3-4-3', '4-2-3-1'];
  const source = officialClub?.formations?.[0] ?? 0;
  return formationIds[Math.abs(source) % formationIds.length];
}

function recoveredTactic(officialClub: typeof RECOVERY_CLUBS[number] | undefined): TacticId {
  const tacticIds: TacticId[] = ['balanced', 'attacking', 'defensive', 'counter', 'down-wings', 'middle-thrust', 'tiki-taka', 'long-ball', 'offense-full', 'defense-full'];
  return tacticIds[Math.abs(officialClub?.tacticsId ?? 0) % tacticIds.length];
}

const MINIMUM_ROSTER_DEPTH: Record<Position, number> = { GK: 1, DF: 5, MF: 5, FW: 3 };

function ensureRosterDepth(rosterInput: ClubPlayer[], level: number, rng: RandomSource, now: Date): ClubPlayer[] {
  const roster = [...rosterInput];
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  for (const player of roster) counts[player.position] += 1;
  let fallbackIndex = 1_000;
  for (const position of Object.keys(MINIMUM_ROSTER_DEPTH) as Position[]) {
    while (counts[position] < MINIMUM_ROSTER_DEPTH[position]) {
      const positionIndex = Math.max(0, POSITIONS.indexOf(position));
      const player = npcPlayer(fallbackIndex + positionIndex, level, rng, now);
      player.position = position;
      player.id = `npc-${fallbackIndex + positionIndex + 1}`;
      roster.push(player);
      counts[position] += 1;
      fallbackIndex += POSITIONS.length;
    }
  }
  return roster;
}

function buildOpponentRoster(officialClub: typeof RECOVERY_CLUBS[number] | undefined, level: number, rng: RandomSource, now: Date): ClubPlayer[] {
  const officialPlayers = officialClub ? (RECOVERY_PLAYERS_BY_CLUB.get(officialClub.id) ?? []).slice(0, 18).map((record) => recoveryClubPlayer(record, level, now)) : [];
  return ensureRosterDepth(officialPlayers, level, rng, now);
}

function leagueClubNames(officialClub: typeof RECOVERY_CLUBS[number] | undefined): string[] {
  const names = officialClub ? RECOVERY_CLUBS.filter((club) => club.league === officialClub.league).map((club) => club.nameEn) : [];
  return names.length >= 2 ? names : CLUB_NAMES;
}

function buildFixtures(clubId: string, season: number, now: Date, participants: string[] = CLUB_NAMES): ClubFixture[] {
  const opponents = participants.filter((name) => name !== clubId);
  const fixtures: ClubFixture[] = [];
  for (const leg of [0, 1]) {
    for (const [index, opponent] of opponents.entries()) {
      const matchday = leg * opponents.length + index + 1;
      const userIsHome = leg === 0 ? index % 2 === 0 : index % 2 !== 0;
      fixtures.push({
        id: `${season}-${matchday}-${clubId}`,
        season,
        matchday,
        homeClub: userIsHome ? clubId : opponent,
        awayClub: userIsHome ? opponent : clubId,
        played: false,
        playedAt: new Date(now.getTime() + matchday * 86_400_000).toISOString()
      });
    }
  }
  return fixtures;
}

export function ensureClubState(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource(), stateField: ClubStateField = 'clubState', clubNameOverride?: string): PlayerProfile {
  const profile = structuredClone(profileInput);
  if (profile[stateField]) return profile;
  const requestedClub = clubNameOverride ?? profile.club;
  const officialClub = RECOVERY_CLUBS.find((club) => club.nameEn === requestedClub) ?? RECOVERY_CLUBS.find((club) => club.league === 1011);
  const clubName = officialClub?.nameEn ?? requestedClub;
  if (stateField === 'clubState' && profile.club === 'Rising City FC') profile.club = clubName;
  const participants = leagueClubNames(officialClub);
  const officialPlayers = officialClub ? (RECOVERY_PLAYERS_BY_CLUB.get(officialClub.id) ?? []).slice(0, 15).map((record) => recoveryClubPlayer(record, profile.level, now)) : [];
  const fallbackPlayers = Array.from({ length: Math.max(0, 15 - officialPlayers.length) }, (_, index) => npcPlayer(index, profile.level, rng, now));
  const baseRoster = [userAsClubPlayer(profile, now), ...officialPlayers, ...fallbackPlayers];
  const roster = stateField === 'coachClubState' ? ensureRosterDepth(baseRoster, profile.level, rng, now) : baseRoster;
  profile[stateField] = {
    id: clubName,
    officialId: officialClub?.id,
    name: clubName,
    level: 1,
    leagueTier: 1,
    officialGrade: officialClub?.grade,
    provenance: officialClub ? 'RECOVERY_VERIFIED' : 'SEED_FALLBACK',
    prestige: officialClub ? Math.round(officialClub.prestige * 100) : 100,
    assets: officialClub?.salaryBase ?? 25_000,
    salaryBudget: officialClub?.coachSalaryBase ?? 5_000,
    formation: '4-4-2',
    tactic: 'balanced',
    roster,
    fixtures: buildFixtures(clubName, profile.league.season, now, participants),
    standings: participants.map((participant) => ({ clubId: participant, clubName: participant, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 })),
    nextFixtureAt: new Date(now.getTime() + 86_400_000).toISOString(),
    championsLeagueQualified: false,
    championsLeagueRound: 0
  };
  return profile;
}

export function getClubRating(profile: PlayerProfile, stateField: ClubStateField = 'clubState'): number {
  const club = profile[stateField];
  if (!club) return getRating(profile);
  const selected = selectPlayingSquad(club.roster, club.formation);
  const average = selected.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, selected.length);
  const formation = FORMATIONS[club.formation];
  const tactic = TACTICS[club.tactic];
  return Math.round(average * (formation.controlMultiplier * tactic.controlMultiplier) + club.level * 2 + club.prestige / 50);
}

export function setClubFormation(profileInput: PlayerProfile, formation: FormationId, now = new Date(), stateField: ClubStateField = 'clubState'): PlayerProfile {
  const profile = ensureClubState(profileInput, now, new MathRandomSource(), stateField);
  if (!FORMATIONS[formation]) throw new Error('Formasi tidak dikenal.');
  profile[stateField]!.formation = formation;
  profile.updatedAt = now.toISOString();
  return profile;
}

export function setClubTactic(profileInput: PlayerProfile, tactic: TacticId, now = new Date(), stateField: ClubStateField = 'clubState'): PlayerProfile {
  const profile = ensureClubState(profileInput, now, new MathRandomSource(), stateField);
  if (!TACTICS[tactic]) throw new Error('Taktik tidak dikenal.');
  profile[stateField]!.tactic = tactic;
  profile.updatedAt = now.toISOString();
  return profile;
}

function recoverClubRoster(roster: ClubPlayer[]): void {
  // ClubPlayer condition recovery between scheduled fixtures is RECOVERY_INFERRED;
  // without it, a 38-round Coach season can permanently exhaust the only GK.
  for (const player of roster) player.hp = clamp(player.hp + 5, 0, player.maxHp);
}

function selectPlayingSquad(roster: ClubPlayer[], formationId: FormationId): ClubPlayer[] {
  const slots = FORMATIONS[formationId].slots;
  const selected: ClubPlayer[] = [];
  for (const position of Object.keys(slots) as Position[]) {
    const players = roster.filter((player) => player.position === position && player.hp > 0).sort((a, b) => (Number(b.isUserPlayer) - Number(a.isUserPlayer)) || (b.overall + b.morale / 10) - (a.overall + a.morale / 10));
    selected.push(...players.slice(0, slots[position]));
  }
  return selected;
}

function getAttackDefence(squad: ClubPlayer[], clubId: string, formationId: FormationId, tacticId: TacticId, isHome: boolean): { attack: number; defence: number } {
  const averageAttack = squad.reduce((sum, player) => sum + player.stats.atk * 0.45 + player.stats.speed * 0.15 + player.stats.power * 0.2 + player.stats.technique * 0.2, 0) / Math.max(1, squad.length);
  const averageDefence = squad.reduce((sum, player) => sum + player.stats.def * 0.5 + player.stats.strength * 0.2 + player.stats.speed * 0.1 + player.stats.technique * 0.2, 0) / Math.max(1, squad.length);
  const formation = FORMATIONS[formationId];
  const tactic = TACTICS[tacticId];
  const homeAdvantage = isHome ? 1.04 : 1;
  return { attack: averageAttack * formation.attackMultiplier * tactic.attackMultiplier * homeAdvantage, defence: averageDefence * formation.defenceMultiplier * tactic.defenceMultiplier };
}

function goals(attack: number, defence: number, rng: RandomSource): number {
  let value = 0;
  const chance = clamp(0.12 + (attack - defence) / 220, 0.05, 0.29);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (rng.next() < chance + attempt * 0.008) value += 1;
  }
  return clamp(value, 0, 6);
}

function halfGoals(attack: number, defence: number, rng: RandomSource): number {
  const fullMatch = goals(attack, defence, rng);
  return clamp(Math.round(fullMatch * 0.5), 0, 3);
}

function outcome(homeGoals: number, awayGoals: number): MatchOutcome {
  if (homeGoals === awayGoals) return 'DRAW';
  return homeGoals > awayGoals ? 'WIN' : 'LOSS';
}

function updateStanding(standing: { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }, gf: number, ga: number): void {
  standing.played += 1;
  standing.goalsFor += gf;
  standing.goalsAgainst += ga;
  if (gf > ga) { standing.wins += 1; standing.points += 3; }
  else if (gf === ga) { standing.draws += 1; standing.points += 1; }
  else standing.losses += 1;
}

function stableClubHash(value: string): number {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
}

export function projectCoachLeagueStandings(club: ClubState): void {
  // The recovered client exposes league/round structures but not authoritative
  // server results for matches between two non-user clubs. This deterministic
  // projection fills those missing rows and remains explicitly RECOVERY_INFERRED.
  const seasonMatches = Math.max(1, club.fixtures.length);
  for (const standing of club.standings) {
    if (standing.clubId === club.id) continue;
    const remaining = Math.max(0, seasonMatches - standing.played);
    if (remaining === 0) continue;
    const official = RECOVERY_CLUBS.find((item) => item.nameEn === standing.clubName);
    const grade = official?.grade ?? 1;
    const prestige = official?.prestige ?? 0;
    const strength = clamp(0.78 + grade * 0.055 + prestige / 2_000 + (stableClubHash(standing.clubId) % 9) / 100, 0.75, 1.25);
    const winRate = clamp(0.18 + (strength - 0.75) * 0.55, 0.16, 0.44);
    const drawRate = clamp(0.28 - Math.abs(strength - 1) * 0.08, 0.16, 0.30);
    const wins = Math.min(remaining, Math.floor(remaining * winRate));
    const draws = Math.min(remaining - wins, Math.floor(remaining * drawRate));
    const losses = remaining - wins - draws;
    const goalsFor = Math.max(0, Math.round(remaining * (0.85 + strength * 0.55)));
    const goalsAgainst = Math.max(0, Math.round(remaining * (1.55 - strength * 0.45)));
    standing.played += remaining;
    standing.wins += wins;
    standing.draws += draws;
    standing.losses += losses;
    standing.goalsFor += goalsFor;
    standing.goalsAgainst += goalsAgainst;
    standing.points += wins * 3 + draws;
  }
}

export function playClubMatch(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource(), stateField: ClubStateField = 'clubState'): ClubMatchResult {
  const profile = ensureClubState(profileInput, now, rng, stateField);
  const club = profile[stateField]!;
  const fixture = club.fixtures.find((item) => !item.played);
  if (!fixture) throw new Error('Musim klub telah selesai. Gunakan `/season-end` untuk memulai musim baru.');
  const userClubIsHome = fixture.homeClub === club.id;
  const homeOfficial = RECOVERY_CLUBS.find((item) => item.nameEn === fixture.homeClub);
  const awayOfficial = RECOVERY_CLUBS.find((item) => item.nameEn === fixture.awayClub);
  const homeFormation = userClubIsHome ? club.formation : recoveredFormation(homeOfficial);
  const awayFormation = userClubIsHome ? recoveredFormation(awayOfficial) : club.formation;
  const homeTactic = userClubIsHome ? club.tactic : recoveredTactic(homeOfficial);
  const awayTactic = userClubIsHome ? recoveredTactic(awayOfficial) : club.tactic;
  const homeRoster = userClubIsHome ? club.roster : buildOpponentRoster(homeOfficial, club.level, rng, now);
  const awayRoster = userClubIsHome ? buildOpponentRoster(awayOfficial, club.level, rng, now) : club.roster;
  recoverClubRoster(homeRoster);
  recoverClubRoster(awayRoster);
  const homeSquad = selectPlayingSquad(homeRoster, homeFormation);
  const awaySquad = selectPlayingSquad(awayRoster, awayFormation);
  if (homeSquad.length < 7 || awaySquad.length < 7) throw new Error('Salah satu club tidak memiliki pemain yang cukup sehat untuk pertandingan.');
  const homeTeam = getAttackDefence(homeSquad, fixture.homeClub, homeFormation, homeTactic, true);
  const awayTeam = getAttackDefence(awaySquad, fixture.awayClub, awayFormation, awayTactic, false);
  const halftimeHomeGoals = halfGoals(homeTeam.attack, awayTeam.defence, rng);
  const halftimeAwayGoals = halfGoals(awayTeam.attack, homeTeam.defence, rng);
  const secondHalfHomeGoals = halfGoals(homeTeam.attack, awayTeam.defence, rng);
  const secondHalfAwayGoals = halfGoals(awayTeam.attack, homeTeam.defence, rng);
  const homeGoals = clamp(halftimeHomeGoals + secondHalfHomeGoals, 0, 6);
  const awayGoals = clamp(halftimeAwayGoals + secondHalfAwayGoals, 0, 6);
  const clubGoals = userClubIsHome ? homeGoals : awayGoals;
  const opponentGoals = userClubIsHome ? awayGoals : homeGoals;
  const result = outcome(clubGoals, opponentGoals);
  const userSquad = userClubIsHome ? homeSquad : awaySquad;
  const mvp = [...userSquad].sort((a, b) => (b.overall + b.morale / 10) - (a.overall + a.morale / 10))[0];
  fixture.played = true;
  fixture.homeGoals = homeGoals;
  fixture.awayGoals = awayGoals;
  fixture.playedAt = now.toISOString();
  const currentStanding = club.standings.find((standing) => standing.clubId === club.id);
  const opponentStanding = club.standings.find((standing) => standing.clubId === (userClubIsHome ? fixture.awayClub : fixture.homeClub));
  if (!currentStanding) throw new Error('Klasemen club tidak memiliki baris untuk club pengguna.');
  updateStanding(currentStanding, clubGoals, opponentGoals);
  if (opponentStanding) updateStanding(opponentStanding, opponentGoals, clubGoals);
  club.assets += result === 'WIN' ? 900 : result === 'DRAW' ? 550 : 300;
  club.prestige = clamp(club.prestige + (result === 'WIN' ? 3 : result === 'DRAW' ? 1 : -1), 0, 1_000);
  club.nextFixtureAt = club.fixtures.find((item) => !item.played)?.playedAt ?? new Date(now.getTime() + 365 * 86_400_000).toISOString();
  for (const player of userSquad) {
    player.appearances += 1;
    player.hp = clamp(player.hp - 5, 0, player.maxHp);
    player.morale = clamp(player.morale + (result === 'WIN' ? 3 : result === 'LOSS' ? -3 : 1), 0, 100);
    if (player.isUserPlayer && stateField === 'clubState') {
      player.goals += clubGoals > 0 && profile.position === 'FW' ? 1 : 0;
      profile.hp = player.hp;
      profile.career.appearances += 1;
      profile.career.goals += player.goals > profile.career.goals ? 1 : 0;
      if (result === 'WIN') profile.career.wins += 1;
      else if (result === 'DRAW') profile.career.draws += 1;
      else profile.career.losses += 1;
    }
  }
  if (stateField === 'clubState') {
    profile.league.points = currentStanding.points;
    profile.league.matchday = fixture.matchday + 1;
    profile.league.wins = currentStanding.wins;
    profile.league.draws = currentStanding.draws;
    profile.league.losses = currentStanding.losses;
    profile.league.goalsFor = currentStanding.goalsFor;
    profile.league.goalsAgainst = currentStanding.goalsAgainst;
  }
  profile.updatedAt = now.toISOString();
  return {
    profile,
    fixture,
    homeGoals,
    awayGoals,
    halftime: { homeGoals: halftimeHomeGoals, awayGoals: halftimeAwayGoals },
    outcome: result,
    mvp,
    commentary: [
      `${fixture.homeClub} menghadapi ${fixture.awayClub} pada matchday ${fixture.matchday}.`,
      `Babak pertama berakhir ${halftimeHomeGoals}-${halftimeAwayGoals}; formasi ${homeFormation} vs ${awayFormation}.`,
      `Taktik: ${TACTICS[homeTactic].name} vs ${TACTICS[awayTactic].name}.`,
      `Skor akhir ${homeGoals}-${awayGoals}; ${mvp.name} menjadi MVP dengan overall ${mvp.overall}.`
    ]
  };
}

export function getNextClubFixture(profileInput: PlayerProfile, now = new Date(), stateField: ClubStateField = 'clubState'): ClubFixture | undefined {
  const profile = ensureClubState(profileInput, now, new MathRandomSource(), stateField);
  return profile[stateField]?.fixtures.find((fixture) => !fixture.played);
}

export function finishSeason(profileInput: PlayerProfile, now = new Date(), stateField: ClubStateField = 'clubState'): PlayerProfile {
  const profile = ensureClubState(profileInput, now, new MathRandomSource(), stateField);
  const club = profile[stateField]!;
  const standing = club.standings.find((item) => item.clubId === club.id)!;
  if (stateField === 'coachClubState') projectCoachLeagueStandings(club);
  profile.league.season += 1;
  profile.league.matchday = 1;
  profile.league.points = 0;
  profile.league.wins = 0;
  profile.league.draws = 0;
  profile.league.losses = 0;
  profile.league.goalsFor = 0;
  profile.league.goalsAgainst = 0;
  const officialClub = RECOVERY_CLUBS.find((item) => item.id === club.officialId) ?? RECOVERY_CLUBS.find((item) => item.nameEn === club.name);
  const participants = leagueClubNames(officialClub);
  club.fixtures = buildFixtures(club.id, profile.league.season, now, participants);
  club.standings = participants.map((participant) => ({ clubId: participant, clubName: participant, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }));
  const currentTier = club.leagueTier ?? 1;
  const maximumPoints = Math.max(3, (club.fixtures.length || 1) * 3);
  // Coach videos show promotion, QCL qualification, and relegation targets;
  // exact thresholds are not recovered, so percentage thresholds are explicit
  // RECOVERY_INFERRED defaults rather than hard-coded short-season values.
  const promoted = standing.points >= Math.ceil(maximumPoints * GAME_BALANCE.coach.promotionRate);
  const relegated = standing.points <= Math.ceil(maximumPoints * GAME_BALANCE.coach.relegationRate) && currentTier > 1;
  club.leagueTier = clamp(currentTier + (promoted ? 1 : relegated ? -1 : 0), 1, 5);
  club.level = clamp(club.level + (promoted ? 1 : 0), 1, 10);
  club.championsLeagueQualified = standing.points >= Math.ceil(maximumPoints * GAME_BALANCE.coach.championshipRate);
  club.championsLeagueRound = club.championsLeagueQualified ? 1 : 0;
  club.nextFixtureAt = club.fixtures[0].playedAt!;
  club.prestige = clamp(club.prestige + (promoted ? 10 : relegated ? -6 : 2), 0, 1_000);
  profile.updatedAt = now.toISOString();
  return profile;
}

export function formatClubStanding(profileInput: PlayerProfile, now = new Date(), stateField: ClubStateField = 'clubState'): string {
  const profile = ensureClubState(profileInput, now, new MathRandomSource(), stateField);
  return [...(profile[stateField]?.standings ?? [])]
    .sort((a, b) => (b.points - a.points) || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)))
    .map((standing, index) => `${index + 1}. ${standing.clubName} — ${standing.points} pts (${standing.wins}-${standing.draws}-${standing.losses})`)
    .join('\n');
}
