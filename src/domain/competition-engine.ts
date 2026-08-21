import { ensureClubState } from './club-engine.js';
import { MathRandomSource, type RandomSource } from './engine.js';
import type { AchievementState, ChampionsLeagueState, MatchOutcome, PlayerProfile } from './types.js';

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

export function startChampionsLeague(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = ensureClubState(profileInput, now);
  if (!profile.clubState!.championsLeagueQualified) throw new Error('Klub belum lolos Champions League. Selesaikan season dengan poin kualifikasi terlebih dahulu.');
  if (profile.championsLeague?.status === 'ACTIVE') return profile;
  profile.championsLeague = {
    season: profile.league.season,
    round: 1,
    opponent: CHAMPIONS_OPPONENTS[0],
    homeGoals: 0,
    awayGoals: 0,
    aggregate: 0,
    status: 'ACTIVE'
  };
  profile.updatedAt = now.toISOString();
  return profile;
}

export function playChampionsLeague(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): { profile: PlayerProfile; homeGoals: number; awayGoals: number; status: ChampionsLeagueState['status']; commentary: string[] } {
  const profile = startChampionsLeague(profileInput, now);
  const state = profile.championsLeague!;
  const clubRating = profile.clubState!.level * 8 + profile.clubState!.prestige / 10 + profile.stats.atk * 0.15 + profile.stats.def * 0.15 + 45;
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
    profile.clubState!.assets += 2_500;
    profile.clubState!.prestige = clamp(profile.clubState!.prestige + 25, 0, 1_000);
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
      `Champions League round ${state.round}: ${profile.club} vs ${state.opponent}.`,
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
  profile.updatedAt = now.toISOString();
  return { profile, achievement };
}

export function formatAchievements(profileInput: PlayerProfile): string {
  const profile = syncAchievements(profileInput);
  return profile.achievements!.map((item) => `${item.claimed ? 'CLAIMED' : item.progress >= item.target ? 'READY' : 'LOCKED'} · **${item.id}** · ${item.title} — ${item.progress}/${item.target}`).join('\n');
}
