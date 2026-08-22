# Versus Match Flow — Evidence-Based Correction

**Date:** 2026-08-22  
**Purpose:** Correct the previous generic four-club/double-round-robin example and describe the closest defensible Versus flow from public and recovery evidence.

## Correction statement

The earlier example invented a four-club double round-robin, six rounds, conventional three-point scoring, and a specific halftime interaction. Those details are useful as a Discord prototype, but they must not be described as the original Football Rising Star Versus rules. The corrected flow below uses only observed mode boundaries, public release signals, recovery fields, and recovery method signatures. Every unresolved coefficient or rule is explicitly marked `RECOVERY_INFERRED`.

## What is directly supported

| Observed element | Evidence status | What can safely be modeled |
|---|---|---|
| Separate Versus Mode entry | `PUBLIC_OFFICIAL` | Versus is its own mode context. |
| Group code in battle mode | `PUBLIC_OFFICIAL` | A user can participate through a group-code mechanism. Exact code policy is unknown. |
| Advanced scout and player-status improvement | `PUBLIC_OFFICIAL` | Versus includes scouting and player-condition/status systems. |
| User status `IDLE`, `ENEROLL`, `GAME`, `GAMEOVER` | `RECOVERY_VERIFIED` | A lifecycle state machine exists. |
| Season/league/group/grade IDs and group club IDs | `RECOVERY_VERIFIED` | Versus has group-scoped competition state. |
| Round schedule and current round | `RECOVERY_VERIFIED` | A season advances through scheduled rounds. |
| `battleID`, `home`, `away` | `RECOVERY_VERIFIED` | A battle is a paired home-away fixture. |
| `GetBattles(roundId)` and `GetCLGroupBattles(seasonId, groupId, roundId)` | `RECOVERY_VERIFIED` | The client resolves round battle pairings for different competition types. |
| Scheduled time, battle state, goals, side rewards | `RECOVERY_VERIFIED` | A compact battle record persists schedule/result/reward state. |
| `BeginBattle`, `FirstHalf`, `SecondHalf`, `BattleEnd` | `RECOVERY_VERIFIED` | The client battle object has a two-half lifecycle. |
| Formation/substitution and MVP/summary methods | `RECOVERY_VERIFIED` | Battle presentation/calculation includes these outputs/hooks. |
| Player HP, injury, status, yellow cards, red-card ban, ability map | `RECOVERY_VERIFIED` | Player eligibility and battle strength depend on condition/state. |
| `ProcessSeasonMatch(sysTime)` and player-condition processing | `RECOVERY_VERIFIED` | Match processing can occur from time progression, not only an interactive click. |
| Standings, score, W/D/L, goals, goal difference, player stats | `RECOVERY_VERIFIED` | Season/club result state is accumulated. |
| Exact group size, round count, point formula, tie-break, promotion/relegation | Not recovered | Must be configuration or product decision. |
| Real-time simultaneous human presence | Not recovered | Must not be claimed or implemented as original behavior without new evidence. |

## Corrected end-to-end flow

### A. Mode entry and lifecycle

The user enters Versus independently from Player and Coach. The recovered user status is normalized for TypeScript as follows:

```text
IDLE
  → ENROLLED      // recovered client label: ENEROLL
  → GAME
  → GAMEOVER
```

The transition to `GAME` should occur only after the user has a valid group, season, league/grade, Versus club, and minimum roster. The exact unlock condition is publicly described by community documentation as after a Coach season, but this should remain configurable because the official store description does not specify the condition.

### B. Group and season resolution

The user enters or creates a group through a group code. The group is associated with a season configuration containing a season ID, league ID, group ID, grade, and club IDs. The client recovery also exposes season maps and a current/last/next season concept in the user save state.

The server/domain layer should resolve the user's active season without creating a new one on every command:

```text
load VersusUserSave
  → validate current sysTime
  → process due season/round state
  → resolve current VersusSeason by season/league/group
  → resolve user's VersusClub
  → display current round and next scheduled battle
```

The exact season cadence, group capacity, and enrollment window are `RECOVERY_INFERRED` until confirmed from a live capture or server documentation.

### C. Round and fixture generation

A `RoundBattleRuleConfig` contains a round, serialized battle definitions, and a parsed battle list. Each `BattleStruct` contains a battle ID, home identifier, and away identifier. The schedule exposes a current round played and a list of round schedules.

The correct domain behavior is therefore:

```text
current season + current round
  → read round battle rule
  → select battle struct for the group/competition type
  → resolve home and away VersusClub
  → create or load VersusBattleMiniData by battleID
```

The data structure proves paired fixtures. It does **not** prove that every season has four clubs, six rounds, double round-robin symmetry, or only human opponents. Those are configuration choices for DISCORDFC until additional evidence is found.

### D. Preparation and player eligibility

The user prepares the active Versus club before the scheduled time. A Versus player carries age, property value, position, captain flag, yellow cards, status, HP, injury type, club ID, red-card ban count, injury end time, ability map, initial age, and growth type.

At lineup validation time, the server/domain engine should call the equivalent of:

```text
player.CanPlay(leagueType, ignoreInjured)
player.BeBan()
player.GetPositionType()
player.GetAbilitysByPosition(position)
```

The validator must reject or consistently handle players who are injured, beyond injury end time, suspended for cards, not registered to the club, duplicated in the lineup, or assigned to an invalid position. Whether the original client allows an injured player with a special option is represented by the `ignoreInjured` parameter and must be kept as a configurable ruleset switch.

### E. Battle start and two-half resolution

When the scheduled battle is due, time-driven processing can invoke the equivalent of `ProcessSeasonMatch(sysTime)`. A battle loads its home and away clubs and enters the two-half lifecycle exposed by the recovered method names:

```text
CREATED/OPEN
  → BEGIN BATTLE
  → FIRST HALF
  → SECOND HALF
  → BATTLE END
  → RESULT SUMMARY
```

The recovered signatures support formation calculation, substitute calculation, player battle summaries, MVP calculation, and team summary fields. The safest DISCORDFC interpretation is to freeze the home and away input states before simulation, then resolve the battle using a persisted seed.

A reconstructed simulation may use the following inputs, but no coefficient should be presented as official:

```text
position ability scores
+ player status/HP/injury/age ratios
+ formation contribution
+ tactic contribution
+ captain/leadership contribution
+ club/group modifiers
+ bounded deterministic variance
→ first-half events
→ second-half events
→ battle result and statistics
```

The existence of `GetBattleRatio`, `AgeRatio`, `HPRatio`, `InjuryRatio`, and `StatusRatio` supports condition-sensitive strength. The relative weights and event probabilities are `RECOVERY_INFERRED`.

### F. Player and club post-battle state

The recovered player methods include HP deduction by position type, injury setting, status changes, card updates, ban clearing, and half/full battle summaries. After the battle ends, the result processor should apply these changes to the exact player snapshot used by the battle.

A safe settlement order is:

```text
apply player appearances and stats
  → apply HP cost
  → apply injury/card/ban changes
  → update club goals and result record
  → update season standings and player leaderboards
  → write side rewards and economy ledger
  → mark battle settled
```

The order and exact HP/injury/card numbers are implementation rules for DISCORDFC unless the method bodies or server responses are recovered.

### G. Result retrieval and season progression

Users retrieve the compact battle result by battle ID. The result should show only fields supported by the recovered shape: home/away clubs, score/goals, battle state, side rewards, team statistics, player statistics, MVP/award where available, and updated standings.

The next round should be made available only after the season clock or current-round state allows it. A retry of result retrieval is read-only. A retry of settlement returns the stored result and cannot issue duplicate rewards.

## Corrected example with unknowns marked

Assume the recovery/configuration resolves one user-owned home club and one opponent club for a battle ID `B-2041-17`. The exact names and values below are placeholders, not claims about the original dataset.

| Field | Home | Away | Status |
|---|---|---|---|
| Battle ID | `B-2041-17` | `B-2041-17` | Recovered field shape; example value is synthetic. |
| Home/Away club ID | `club-H` | `club-A` | Recovered field shape; IDs are synthetic. |
| Round | `round-r` | `round-r` | Recovered schedule concept; value is synthetic. |
| Formation | `formation-H` | `formation-A` | Recovery hook exists; selected IDs are synthetic. |
| Tactic | `tactic-H` | `tactic-A` | Recovery hook exists; numeric effect is inferred. |
| Battle state | `OPEN → SETTLED` | `OPEN → SETTLED` | State progression is reconstructed from mini-data/state semantics. |

The user submits a legal lineup. The scheduler detects that the battle is due, creates the battle object, runs the first-half and second-half stages, calculates a result, and writes the compact result. The result might be `2–1` in a local test, but that score has no evidentiary significance. The authoritative requirements are that the result has the same battle ID, both sides, battle state, goals, player/team summary, side reward fields, and one-time settlement behavior.

If the home captain has low HP, the battle engine must use the HP/status ratio component and then apply the post-battle HP cost to the locked snapshot. If the away striker is injured until after the scheduled time, the validator must apply the chosen `CanPlay` rule consistently. If a second worker processes the same battle, it must return the first settlement rather than run a second reward path.

## What must be removed from the previous example

The following details must not be presented as original until new evidence is obtained:

| Previous detail | Correct treatment |
|---|---|
| Four clubs in every group | Configurable example only. |
| Six rounds and double round-robin | Configurable example only. |
| Three points for a win and one for a draw | Conventional adaptation; `RECOVERY_INFERRED`. |
| Exact halftime coach action | Recovery shows first/second half methods, not the exact Discord interaction. |
| Exact scoreline and minute-by-minute events | Synthetic demonstration only. |
| Exact reward amounts | Synthetic balance only. |
| Exact promotion/relegation | Not recovered; defer/configure. |
| Real-time PvP | Unverified; use online scheduled/asynchronous model first. |

## Implementation contract

The next code implementation should create a separate Versus domain aggregate with stable battle IDs, group/season/club/player state, round-rule lookup, lineup eligibility, two-half simulation, immutable snapshots, atomic settlement, player condition/card updates, standings, rewards, and idempotent retries. It should preserve a ruleset version on every battle so future recovery discoveries can change new matches without rewriting history.

All coefficients, cadence defaults, group constraints, standings points, tie-breaks, promotion rules, and real-time interpretation must be labeled `RECOVERY_INFERRED` until directly verified.

## References

[1]: https://apps.apple.com/sg/app/football-rising-star/id1585604439?platform=tv "Football Rising Star — App Store screenshot with three mode entries"

[2]: https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko "Football Rising Star — Korean App Store release metadata"

[3]: https://namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — Korean community wiki"

[4]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — English community mirror"

[5]: https://github.com/atsilahbusiness-design/DISCORDFC/blob/main/docs/VERSUS_30_REFERENCE_MANIFEST.md "DISCORDFC 30-reference Versus manifest"
