# Coach Multiplayer Recovery Findings

**Status:** Recovery evidence, not a claim of server parity  
**Date:** 2026-08-22  
**Source:** `dump.cs`, `recovery_gameplay_config_signatures.txt`, and client payload inventory.

## Conclusion

The recovered client contains a distinct **Versus multiplayer subsystem** and a separate **Coach battle subsystem**. The evidence is stronger than a simple single-player simulation: the client models a season-wide league shared through synchronized data, multiple clubs, scheduled rounds, home/away battles, user-versus-NPC distinctions, serialized battle payloads, and network synchronization methods. However, the recovery artifacts expose class signatures and method names rather than the original server implementation, endpoint contracts, authentication, matchmaking service, or authoritative database. We can reconstruct a compatible Discord multiplayer state machine, but we must label formulas and network behavior not directly observable as `RECOVERY_INFERRED`.

## Direct evidence

| Recovered class or field | Observable evidence | Multiplayer implication |
|---|---|---|
| `VersusUserStatus` | States `IDLE`, `ENEROLL`, `GAME`, `GAMEOVER`. | A user-facing multiplayer session lifecycle exists. |
| `VersusSeason` | `LeagueId`, `LeagueGrade`, `CurrentRoundPlayed`, `RoundSchedule`, `LeagueClubDict`, best-player fields, `SyncSeasonData()`, `PlayLeagueMatch()`, `IsHasLeagueMatch()`, `SeasonEnd()`, `GetClubLeagueRank()`, and `SyncOtherClubBuyPlayerConditionInLeagueRound()`. | Shared season, round schedule, league standings, match execution, awards, and cross-club synchronization are modeled. |
| `VersusBattle` | `BattleID`, `State`, `HomeClub`, `AwayClub`, serialized formatter, battle/club/player classes. | Individual versus fixtures have stable identity, two sides, lifecycle, and persisted results. |
| `VersusBattleClub` and `VersusBattlePlayer` | Home/away battle players have scores, goals, assists, cards, injuries, positions, captain state, and goal times. | Match results can be computed and displayed at club and player level. |
| `CoachBattleMiniSaveData` | `BattleId`, `HomeClubId`, `AwayClubId`, `HomeGoal`, `AwayGoal`, `SeasonId`, `HomePlayerList`, `AwayPlayerList`, `HomeCoach`, `AwayCoach`, `State`, `LeagueId`. | The exact compact battle payload contains both coaches and both squads, suitable for Discord match resolution. |
| `BattleCoach` and `CoachBase` | `IsUser()`, coach ID/name/score, club ID, ability/formation levels, `CanPlay()`, and user-result helpers. | A fixture can distinguish a human coach from NPC and assign coach-specific performance. |
| `CoachBattleClub` | `GetUserBattleResult()`, `GetUserPlayer()`, `GetOpponentClub()`, formation unpack/pack methods. | Coach match results and opponent lookup are explicit. |
| `CoachBattlePlayer` | `GetAtk()`, `GetDef()`, `CalculateSocre()`, participation, goal/assist/card/injury weights, and battle summary methods. | Player-level match simulation is data-driven around attack, defence, participation, and performance score. |
| `BattleStruct` and `RoundBattleRuleConfig` | `battleID`, `home`, `away`, `GetBattles(roundId)`, `GetCLGroupBattles(...)`. | Fixtures are defined as stable home/away pairings per round. |
| `CoachTacticsConfig` | `atk`, `def`, `ballControl`, restricted tactics, conflict formation, and ball-control rate. | Tactics have explicit numeric dimensions and interaction rules. |
| `FormationConfig` | back/mid/forward/goalkeeper counts, weight, formation string, `CoachFormationId`, position map. | Formation validation and positional allocation can be reconstructed. |
| `CoachBattle*SaveDataFormatter` and `Versus*Formatter` | MessagePack serializers/deserializers for battle, season, club, player, coach, and statistics objects. | The client persists/transfers structured battle state, but the transport envelope remains unknown. |

## What can be reconstructed with confidence

The Discord implementation can safely reproduce a multiplayer Coach season with human-owned clubs, club ownership bound to Discord user IDs, a shared league, deterministic round fixtures, home/away matches, formation and tactic choices, roster snapshots, match results, standings, season awards, and idempotent result settlement. The recovery evidence justifies separate `Coach` and `Versus` state, not merely adding a multiplayer flag to the existing Player profile.

The first multiplayer design should use one server-side `CoachLeague` aggregate per Discord guild or configured competition. Each `CoachClub` belongs to one `coachUserId`; each round contains fixtures; a fixture references both club IDs and a deterministic seed; and settlement writes both sides' result, rewards, player statistics, and standings in one transaction. When one side is not human-controlled, the opponent is an NPC generated from recovery club/player data. When both sides are human-controlled, the match still resolves from stored snapshots rather than requiring both users to be online at the same instant.

## What remains unverified

The recovery does not reveal the authoritative server API, authentication protocol, matchmaking queue, latency model, conflict resolution policy, anti-cheat logic, exact server-side formula bodies, or whether the original Versus mode maps one-to-one to the Coach mode UI in every client version. The words `SyncSeasonData`, `PlayLeagueMatch`, and `OnNetworkError` prove network-aware synchronization exists in the client, but they do not reveal endpoint URLs or payload schemas. Those elements must be implemented as compatible Discord-domain behavior and labeled `RECOVERY_INFERRED`.

## Recommended Discord translation

| Original concept | Discord implementation |
|---|---|
| `VersusSeason` | `CoachLeagueSeason` persisted in PostgreSQL, keyed by `guildId` and season ID. |
| `VersusClub` / `CoachBattleClub` | `CoachClub` with `ownerUserId`, club ID, roster, formation, tactics, budget, and rating. |
| `VersusBattle` / `CoachBattleMiniSaveData` | `CoachFixture` with home/away club IDs, round, seed, state, result, and settlement version. |
| `VersusUserStatus` | Coach session/season status: `IDLE`, `ENROLLED`, `IN_MATCH`, `SEASON_COMPLETE`. |
| `SyncSeasonData()` | Read-through league snapshot and optimistic-concurrency refresh. |
| `PlayLeagueMatch()` | Deterministic domain settlement that updates both clubs atomically. |
| `GetUserBattleResult()` | `/coach-result` and post-match embed scoped to the requesting coach. |
| `GetClubLeagueRank()` / `SeasonEndRankAward()` | `/coach-table`, `/coach-season`, and season reward settlement. |
| `SyncOtherClubBuyPlayerConditionInLeagueRound()` | Lock or publish transfer window changes at round boundaries so all coaches see consistent rosters. |

## Provenance rule

Class names, field names, serializer presence, state names, and method signatures are treated as `RECOVERY_VERIFIED`. Numeric match formulas, ranking weights, matchmaking rules, reward values, and network protocol details remain `RECOVERY_INFERRED` until authoritative documentation or controlled server captures are available.


## Additional Versus-specific recovery evidence

The deeper dump regions distinguish a standalone Versus runtime from the ordinary Coach career loop:

| Class/field | Direct evidence | Design meaning |
|---|---|---|
| `VersusUser` | `UserGameStatus`, `IsInEnrollStatus`, `IsInGameStatus`, `IsInGameOverStatus`, `Login`, `Logout`, `InitUserData`, `OnTimeChanged`, and async `ProcessGameProcedure`. | Versus has its own user lifecycle and time-driven online procedure. |
| `VersusUserSave` | `_ClubId`, `GameStatus`, `VersusMoney`, `VersusCoin`, `CurLeagueId`, `LastSysTime`, season IDs/maps, scout arrays, `SeasonScoreDic`, `SeasonDiffGoalDic`, `VersusSeasonPlayed`, and async `ProcessSeasonMatch`. | Versus persists a separate economy, club, current league, season history, ranking score, goal difference, and scheduled match processing. |
| `VersusSeasonConfig` | `SeasonId`, `LeagueId`, `GroupId`, `LeagueGrade`, `GroupClubIds`, `CreateTime`, and `GetOtherLeagueClubIdsExceptMySelf(...)`. | A user is placed into a specific online league/group with other clubs and NPC fallback IDs. |
| `VersusBattleMiniData` | `LeagueType`, `BattleID`, `HomeId`, `AwayId`, `HomeGoal`, `AwayGoal`, `Time`, `State`, `HomeReward`, `AwayReward`, and embedded `BattleData`. | The server/client settlement payload has stable fixture identity, scheduled time, state, both results, and side-specific rewards. |
| `VersusBattle` | `Init`, `BeginBattle`, `FirstHalf`, `SecondHalf`, `BattleEnd`, `CalculateResult`, formation/substitute calculation, MVP calculation, and `FakeBattleSummary`. | The match engine is a two-half deterministic/simulated battle with summarized results; the compact payload can also represent a server-provided result. |
| `VersusBattleClub` | Ball control, shots, shots on target, corners, yellow cards, battle award, result type, playing list, `CalcBattleAward`, tactic/formation add-ratio hooks, and attack/defence getters. | Versus match output includes team statistics and tactic/formation effects, not only a final score. |
| `VersusClub` | Club ID/name/icon/country/grade, goals for/against, rank, score, win/draw/loss, player dictionary, player statistics, and diff goal. | The online league is club-based with standings and per-player seasonal statistics. |

This evidence supports an **online, time-driven, asynchronous or server-synchronized Versus mode** more strongly than the Player videos do. It still does not expose the original endpoint URLs, authentication, or authoritative server formula. Those remain `RECOVERY_INFERRED` for DISCORDFC.
