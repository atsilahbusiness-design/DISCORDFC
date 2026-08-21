import { createInitialProfile, getRating, MathRandomSource, type RandomSource } from './engine.js';
import { FORMATIONS, TACTICS, type ClubFixture, type ClubMatchResult, type ClubPlayer, type FormationId, type MatchOutcome, type PlayerProfile, type Position, type TacticId } from './types.js';
import { SEED_CLUB_NAMES, SEED_PLAYER_NAMES, SEED_ROSTER_POSITIONS } from '../config/seed-data.js';
import { RECOVERY_CLUBS, RECOVERY_PLAYERS_BY_CLUB, type RecoveryPlayerRecord } from '../config/recovery-data.js';

const RECOVERY_PRIMARY_CLUB_NAMES = RECOVERY_CLUBS.filter((club) => club.league === 1011).map((club) => club.nameEn);
const CLUB_NAMES = RECOVERY_PRIMARY_CLUB_NAMES.length >= 10 ? RECOVERY_PRIMARY_CLUB_NAMES : SEED_CLUB_NAMES;
const POSITIONS: Position[] = SEED_ROSTER_POSITIONS;
const PLAYER_NAMES = SEED_PLAYER_NAMES;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function userAsClubPlayer(profile: PlayerProfile): ClubPlayer {
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
    contractUntil: new Date(Date.now() + 365 * 86_400_000).toISOString(),
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

function recoveryClubPlayer(record: RecoveryPlayerRecord, level: number): ClubPlayer {
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
    contractUntil: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    isUserPlayer: false,
    goals: 0,
    assists: 0,
    appearances: 0
  };
}

function npcPlayer(index: number, level: number, rng: RandomSource): ClubPlayer {
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
    contractUntil: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    isUserPlayer: false,
    goals: 0,
    assists: 0,
    appearances: 0
  };
}

function buildFixtures(clubId: string, season: number, now: Date): ClubFixture[] {
  return CLUB_NAMES.filter((name) => name !== clubId).map((opponent, index) => ({
    id: `${season}-${index + 1}-${clubId}`,
    season,
    matchday: index + 1,
    homeClub: index % 2 === 0 ? clubId : opponent,
    awayClub: index % 2 === 0 ? opponent : clubId,
    played: false,
    playedAt: new Date(now.getTime() + (index + 1) * 86_400_000).toISOString()
  }));
}

export function ensureClubState(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const profile = structuredClone(profileInput);
  if (profile.clubState) return profile;
  const officialClub = RECOVERY_CLUBS.find((club) => club.nameEn === profile.club) ?? RECOVERY_CLUBS.find((club) => club.league === 1011);
  if (officialClub && profile.club === 'Rising City FC') profile.club = officialClub.nameEn;
  const officialPlayers = officialClub ? (RECOVERY_PLAYERS_BY_CLUB.get(officialClub.id) ?? []).slice(0, 15).map((record) => recoveryClubPlayer(record, profile.level)) : [];
  const fallbackPlayers = Array.from({ length: Math.max(0, 15 - officialPlayers.length) }, (_, index) => npcPlayer(index, profile.level, rng));
  const roster = [userAsClubPlayer(profile), ...officialPlayers, ...fallbackPlayers];
  profile.clubState = {
    id: profile.club,
    officialId: officialClub?.id,
    name: officialClub?.nameEn ?? profile.club,
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
    fixtures: buildFixtures(profile.club, profile.league.season, now),
    standings: CLUB_NAMES.map((clubName) => ({ clubId: clubName, clubName, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 })),
    nextFixtureAt: new Date(now.getTime() + 86_400_000).toISOString(),
    championsLeagueQualified: false,
    championsLeagueRound: 0
  };
  return profile;
}

export function getClubRating(profile: PlayerProfile): number {
  const club = profile.clubState;
  if (!club) return getRating(profile);
  const selected = selectPlayingSquad(club.roster, club.formation);
  const average = selected.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, selected.length);
  const formation = FORMATIONS[club.formation];
  const tactic = TACTICS[club.tactic];
  return Math.round(average * (formation.controlMultiplier * tactic.controlMultiplier) + club.level * 2 + club.prestige / 50);
}

export function setClubFormation(profileInput: PlayerProfile, formation: FormationId, now = new Date()): PlayerProfile {
  const profile = ensureClubState(profileInput, now);
  if (!FORMATIONS[formation]) throw new Error('Formasi tidak dikenal.');
  profile.clubState!.formation = formation;
  profile.updatedAt = now.toISOString();
  return profile;
}

export function setClubTactic(profileInput: PlayerProfile, tactic: TacticId, now = new Date()): PlayerProfile {
  const profile = ensureClubState(profileInput, now);
  if (!TACTICS[tactic]) throw new Error('Taktik tidak dikenal.');
  profile.clubState!.tactic = tactic;
  profile.updatedAt = now.toISOString();
  return profile;
}

function selectPlayingSquad(roster: ClubPlayer[], formationId: FormationId): ClubPlayer[] {
  const slots = FORMATIONS[formationId].slots;
  const selected: ClubPlayer[] = [];
  for (const position of Object.keys(slots) as Position[]) {
    const players = roster.filter((player) => player.position === position).sort((a, b) => (Number(b.isUserPlayer) - Number(a.isUserPlayer)) || (b.overall + b.morale / 10) - (a.overall + a.morale / 10));
    selected.push(...players.slice(0, slots[position]));
  }
  return selected;
}

function getAttackDefence(squad: ClubPlayer[], clubId: string, formationId: FormationId, tacticId: TacticId): { attack: number; defence: number } {
  const averageAttack = squad.reduce((sum, player) => sum + player.stats.atk * 0.45 + player.stats.speed * 0.15 + player.stats.power * 0.2 + player.stats.technique * 0.2, 0) / Math.max(1, squad.length);
  const averageDefence = squad.reduce((sum, player) => sum + player.stats.def * 0.5 + player.stats.strength * 0.2 + player.stats.speed * 0.1 + player.stats.technique * 0.2, 0) / Math.max(1, squad.length);
  const formation = FORMATIONS[formationId];
  const tactic = TACTICS[tacticId];
  const homeAdvantage = clubId === squad.find((player) => player.isUserPlayer)?.id ? 1 : 1;
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

export function playClubMatch(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): ClubMatchResult {
  const profile = ensureClubState(profileInput, now, rng);
  const club = profile.clubState!;
  const fixture = club.fixtures.find((item) => !item.played);
  if (!fixture) throw new Error('Musim klub telah selesai. Gunakan `/season-end` untuk memulai musim baru.');
  const squad = selectPlayingSquad(club.roster, club.formation);
  const userClubIsHome = fixture.homeClub === club.id;
  const userTeam = getAttackDefence(squad, club.id, club.formation, club.tactic);
  const opponentRating = 52 + fixture.matchday * 2 + Math.floor(rng.next() * 24);
  const opponentAttack = opponentRating * (0.8 + rng.next() * 0.25);
  const opponentDefence = opponentRating * (0.8 + rng.next() * 0.25);
  const homeGoals = userClubIsHome ? goals(userTeam.attack + 6, opponentDefence, rng) : goals(opponentAttack + 4, userTeam.defence, rng);
  const awayGoals = userClubIsHome ? goals(opponentAttack, userTeam.defence, rng) : goals(userTeam.attack, opponentDefence, rng);
  const clubGoals = userClubIsHome ? homeGoals : awayGoals;
  const opponentGoals = userClubIsHome ? awayGoals : homeGoals;
  const result = outcome(clubGoals, opponentGoals);
  const mvp = [...squad].sort((a, b) => b.overall - a.overall)[0];
  fixture.played = true;
  fixture.homeGoals = homeGoals;
  fixture.awayGoals = awayGoals;
  fixture.playedAt = now.toISOString();
  const currentStanding = club.standings.find((standing) => standing.clubId === club.id)!;
  const opponentStanding = club.standings.find((standing) => standing.clubId === (userClubIsHome ? fixture.awayClub : fixture.homeClub));
  updateStanding(currentStanding, clubGoals, opponentGoals);
  if (opponentStanding) updateStanding(opponentStanding, opponentGoals, clubGoals);
  club.assets += result === 'WIN' ? 900 : result === 'DRAW' ? 550 : 300;
  club.prestige = clamp(club.prestige + (result === 'WIN' ? 3 : result === 'DRAW' ? 1 : -1), 0, 1_000);
  club.nextFixtureAt = club.fixtures.find((item) => !item.played)?.playedAt ?? new Date(now.getTime() + 365 * 86_400_000).toISOString();
  for (const player of squad) {
    player.appearances += 1;
    player.hp = clamp(player.hp - 5, 0, player.maxHp);
    player.morale = clamp(player.morale + (result === 'WIN' ? 3 : result === 'LOSS' ? -3 : 1), 0, 100);
    if (player.isUserPlayer) {
      player.goals += clubGoals > 0 && profile.position === 'FW' ? 1 : 0;
      profile.hp = player.hp;
      profile.career.appearances += 1;
      profile.career.goals += player.goals > profile.career.goals ? 1 : 0;
      if (result === 'WIN') profile.career.wins += 1;
      else if (result === 'DRAW') profile.career.draws += 1;
      else profile.career.losses += 1;
    }
  }
  profile.league.points = currentStanding.points;
  profile.league.matchday = fixture.matchday + 1;
  profile.league.wins = currentStanding.wins;
  profile.league.draws = currentStanding.draws;
  profile.league.losses = currentStanding.losses;
  profile.league.goalsFor = currentStanding.goalsFor;
  profile.league.goalsAgainst = currentStanding.goalsAgainst;
  profile.updatedAt = now.toISOString();
  return {
    profile,
    fixture,
    homeGoals,
    awayGoals,
    outcome: result,
    mvp,
    commentary: [
      `${fixture.homeClub} menghadapi ${fixture.awayClub} pada matchday ${fixture.matchday}.`,
      `Formasi ${club.formation} dan taktik ${TACTICS[club.tactic].name} menghasilkan rating klub ${getClubRating(profile)}.`,
      `${mvp.name} terpilih sebagai MVP pertandingan dengan overall ${mvp.overall}.`
    ]
  };
}

export function getNextClubFixture(profileInput: PlayerProfile, now = new Date()): ClubFixture | undefined {
  const profile = ensureClubState(profileInput, now);
  return profile.clubState?.fixtures.find((fixture) => !fixture.played);
}

export function finishSeason(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = ensureClubState(profileInput, now);
  const club = profile.clubState!;
  const standing = club.standings.find((item) => item.clubId === club.id)!;
  profile.league.season += 1;
  profile.league.matchday = 1;
  profile.league.points = 0;
  profile.league.wins = 0;
  profile.league.draws = 0;
  profile.league.losses = 0;
  profile.league.goalsFor = 0;
  profile.league.goalsAgainst = 0;
  club.fixtures = buildFixtures(club.id, profile.league.season, now);
  club.standings = CLUB_NAMES.map((clubName) => ({ clubId: clubName, clubName, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }));
  const currentTier = club.leagueTier ?? 1;
  const promoted = standing.points >= 18;
  const relegated = standing.points <= 4 && currentTier > 1;
  club.leagueTier = clamp(currentTier + (promoted ? 1 : relegated ? -1 : 0), 1, 5);
  club.level = clamp(club.level + (promoted ? 1 : 0), 1, 10);
  club.championsLeagueQualified = standing.points >= 15;
  club.championsLeagueRound = club.championsLeagueQualified ? 1 : 0;
  club.nextFixtureAt = club.fixtures[0].playedAt!;
  club.prestige = clamp(club.prestige + (promoted ? 10 : relegated ? -6 : 2), 0, 1_000);
  profile.updatedAt = now.toISOString();
  return profile;
}

export function formatClubStanding(profileInput: PlayerProfile, now = new Date()): string {
  const profile = ensureClubState(profileInput, now);
  return [...(profile.clubState?.standings ?? [])]
    .sort((a, b) => (b.points - a.points) || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)))
    .map((standing, index) => `${index + 1}. ${standing.clubName} — ${standing.points} pts (${standing.wins}-${standing.draws}-${standing.losses})`)
    .join('\n');
}
