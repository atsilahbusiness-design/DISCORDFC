import { ensureClubState } from './club-engine.js';
import { MathRandomSource, type RandomSource } from './engine.js';
import type { AchievementState, ChampionsLeagueState, CareerMode, MatchOutcome, PlayerProfile } from './types.js';

const CHAMPIONS_OPPONENTS = ['Royal County', 'Capital Sporting', 'Golden Valley', 'Northbridge United'];

function clone<T>(value: T): T {
  return structuredClone(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function goal(attack: number, defence: number, rng: RandomSource): number {
  let count = 0;
  const chance = clamp(0.14 + (attack - defence) / 220, 0.06, 0.3);
  for (let index = 0; index < 7; index += 1) if (rng.next() < chance + index * 0.01) count += 1;
  return Math.min(count, 5);
}

function result(forGoals: number, againstGoals: number): MatchOutcome {
  if (forGoals > againstGoals) return 'WIN';
  if (forGoals < againstGoals) return 'LOSS';
  return 'DRAW';
}

export type ChampionsLeagueMode = Extract<CareerMode, 'PLAYER' | 'COACH'>;

function competitionState(profile: PlayerProfile, mode: ChampionsLeagueMode): ChampionsLeagueState | undefined {
  return mode === 'COACH' ? profile.coach?.championsLeague : profile.championsLeague;
}

function setCompetitionState(profile: PlayerProfile, mode: ChampionsLeagueMode, state: ChampionsLeagueState): void {
  if (mode === 'COACH') {
    if (!profile.coach) throw new Error('Karier Coach belum dibuat.');
    profile.coach.championsLeague = state;
  } else {
    profile.championsLeague = state;
  }
}

function competitionSeason(profile: PlayerProfile, mode: ChampionsLeagueMode): number {
  if (mode === 'COACH') {
    if (!profile.coach) throw new Error('Karier Coach belum dibuat. Jalankan `/coach-career action:start` terlebih dahulu.');
    return profile.coach.season;
  }
  return profile.league.season;
}

function competitionClub(profile: PlayerProfile, mode: ChampionsLeagueMode) {
  const club = mode === 'COACH' ? profile.coachClubState : profile.clubState;
  if (!club) throw new Error('State klub belum dibuat.');
  return club;
}

export function startChampionsLeague(profileInput: PlayerProfile, now = new Date(), mode: ChampionsLeagueMode = 'PLAYER', rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const profile = ensureClubState(profileInput, now, rng, mode === 'COACH' ? 'coachClubState' : 'clubState');
  if (mode === 'COACH' && profile.coach?.status !== 'EMPLOYED') throw new Error('Coach harus employed untuk mengikuti Champions League.');
  const club = competitionClub(profile, mode);
  if (!club.championsLeagueQualified) throw new Error('Klub belum lolos Champions League. Selesaikan season dengan poin kualifikasi terlebih dahulu.');
  const season = competitionSeason(profile, mode);
  const current = competitionState(profile, mode);
  if (current?.season === season) {
    if (current.status === 'ACTIVE') return profile;
    throw new Error('Champions League season ini sudah selesai. Tunggu season berikutnya untuk mencoba lagi.');
  }
  setCompetitionState(profile, mode, {
    season,
    round: 1,
    opponent: CHAMPIONS_OPPONENTS[0],
    homeGoals: 0,
    awayGoals: 0,
    aggregate: 0,
    status: 'ACTIVE'
  });
  profile.updatedAt = now.toISOString();
  return profile;
}

export function playChampionsLeague(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource(), mode: ChampionsLeagueMode = 'PLAYER'): { profile: PlayerProfile; homeGoals: number; awayGoals: number; status: ChampionsLeagueState['status']; commentary: string[] } {
  const profile = startChampionsLeague(profileInput, now, mode, rng);
  const club = competitionClub(profile, mode);
  const state = competitionState(profile, mode)!;
  const rosterRating = club.roster.length ? club.roster.reduce((sum, player) => sum + player.overall, 0) / club.roster.length : 50;
  const clubRating = mode === 'COACH'
    ? club.level * 8 + club.prestige / 10 + rosterRating * 0.25 + (profile.coach?.abilities.tactics.level ?? 1) * 1.5 + 45
    : club.level * 8 + club.prestige / 10 + profile.stats.atk * 0.15 + profile.stats.def * 0.15 + 45;
  const opponentRating = 55 + state.round * 4 + Math.floor(rng.next() * 18);
  const homeGoals = goal(clubRating + 5, opponentRating, rng);
  const awayGoals = goal(opponentRating, clubRating, rng);
  const outcome = result(homeGoals, awayGoals);
  state.homeGoals += homeGoals;
  state.awayGoals += awayGoals;
  state.aggregate = state.homeGoals - state.awayGoals;
  let status: ChampionsLeagueState['status'] = state.status;
  if (outcome === 'LOSS' || (outcome === 'DRAW' && rng.next() < 0.5)) {
    status = 'ELIMINATED';
  } else if (state.round >= 4) {
    status = 'CHAMPION';
    club.assets += 2_500;
    club.prestige = clamp(club.prestige + 25, 0, 1_000);
  } else {
    state.round += 1;
    state.opponent = CHAMPIONS_OPPONENTS[state.round - 1] ?? `Continental Club ${state.round}`;
  }
  state.status = status;
  profile.updatedAt = now.toISOString();
  return {
    profile,
    homeGoals,
    awayGoals,
    status,
    commentary: [
      `Champions League round ${state.round}: ${club.name} vs ${state.opponent}.`,
      `Skor leg: ${homeGoals}–${awayGoals}; aggregate: ${state.aggregate}.`,
      status === 'CHAMPION' ? 'Klub menjadi juara Champions League.' : status === 'ELIMINATED' ? 'Klub tersingkir dari Champions League.' : `Klub melaju ke round ${state.round}.`
    ]
  };
}

const DEFAULT_ACHIEVEMENTS: AchievementState[] = [
  { id: 'appearances-10', title: 'Regular Starter', description: 'Mainkan 10 pertandingan.', target: 10, progress: 0, claimed: false, rewardMoney: 500, rewardExp: 100 },
  { id: 'goals-10', title: 'Clinical Finisher', description: 'Cetak 10 gol.', target: 10, progress: 0, claimed: false, rewardMoney: 750, rewardExp: 150 },
  { id: 'wins-10', title: 'Winning Mentality', description: 'Menangkan 10 pertandingan.', target: 10, progress: 0, claimed: false, rewardMoney: 1_000, rewardExp: 200 },
  { id: 'streak-7', title: 'Daily Commitment', description: 'Capai daily streak 7 hari.', target: 7, progress: 0, claimed: false, rewardMoney: 600, rewardExp: 120 }
];

export function syncAchievements(profileInput: PlayerProfile): PlayerProfile {
  const profile = clone(profileInput);
  const current = profile.achievements ?? clone(DEFAULT_ACHIEVEMENTS);
  for (const achievement of current) {
    if (achievement.id === 'appearances-10') achievement.progress = profile.career.appearances;
    if (achievement.id === 'goals-10') achievement.progress = profile.career.goals;
    if (achievement.id === 'wins-10') achievement.progress = profile.career.wins;
    if (achievement.id === 'streak-7') achievement.progress = profile.daily?.streak ?? 0;
  }
  profile.achievements = current;
  return profile;
}

export function claimAchievement(profileInput: PlayerProfile, achievementId: string, now = new Date()): { profile: PlayerProfile; achievement: AchievementState } {
  const profile = syncAchievements(profileInput);
  const achievement = profile.achievements!.find((item) => item.id === achievementId);
  if (!achievement) throw new Error('Achievement tidak ditemukan.');
  if (achievement.claimed) throw new Error('Achievement sudah diklaim.');
  if (achievement.progress < achievement.target) throw new Error(`Progress belum cukup: ${achievement.progress}/${achievement.target}.`);
  achievement.claimed = true;
  profile.money += achievement.rewardMoney;
  profile.totalExp += achievement.rewardExp;
  profile.level = Math.max(profile.level, Math.floor(profile.totalExp / 100) + 1);
  profile.ledger ??= [];
  profile.ledger.unshift({ id: `${profile.userId}-ACHIEVEMENT-${achievement.id}-${now.getTime()}-${profile.ledger.length}`, createdAt: now.toISOString(), type: 'ACHIEVEMENT_REWARD', amount: achievement.rewardMoney, balanceAfter: profile.money, note: `Achievement ${achievement.title}` });
  profile.ledger = profile.ledger.slice(0, 100);
  profile.updatedAt = now.toISOString();
  return { profile, achievement };
}

export function formatAchievements(profileInput: PlayerProfile): string {
  const profile = syncAchievements(profileInput);
  return profile.achievements!.map((item) => `${item.claimed ? 'CLAIMED' : item.progress >= item.target ? 'READY' : 'LOCKED'} · **${item.id}** · ${item.title} — ${item.progress}/${item.target}`).join('\n');
}
