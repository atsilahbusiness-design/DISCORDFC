# Versus Mode — Public and Recovery Research

**Status:** Deep mode research  
**Tanggal:** 2026-08-22  
**Provenance:** Public evidence and recovery schema are separated from inferred server behavior.

## Conclusion

Football Rising Star has a distinct **Versus/Match Mode** in addition to Player and Coach modes. Public community documentation states that the battle mode becomes available after completing one season in Director/Coach Mode. The Korean App Store release-note index also exposes wording that a Versus Mode **group-code function** was added, along with advanced scouting and player-condition improvements. These are strong indicators that Versus is the product's online/group competition layer, matching the user's first-party clarification.

The recovered client does not reveal the original server endpoints or authentication, but it contains a dedicated Versus runtime, save state, season/group schema, scheduled battle payload, result settlement, rewards, standings, player statistics, scouting, and time-change processing. The most defensible model is an **online, group-based, time-driven, asynchronous or server-synchronized mode**, not proven real-time simultaneous PvP.

## Public evidence

| Source | Direct evidence | Confidence |
|---|---|---|
| NamuWiki | The game has Player Mode, Director/Coach Mode, and a battle mode that opens after one Director/Coach season is completed. | `PUBLIC_REPORTED`; community source. |
| Korean App Store listing/release-note index | Versus Mode has a group-code function; advanced scouting and player-condition enhancement were added. | `PUBLIC_INDEXED`; official store metadata, but the exact original server contract is not exposed. |
| English store descriptions | They market Player and Coach as the two unique career modes, but do not describe the online Versus subsystem in the short description. | `OFFICIAL_PRODUCT_COPY`; incomplete mode inventory. |
| Public gameplay videos | The 20 Player videos and six Coach/overview videos show no Versus lobby or live PvP session. | Negative evidence only; not proof that Versus does not exist. |

## Recovered runtime model

```text
VersusUser
  ├── UserGameStatus: enroll → game → game over lifecycle
  ├── VersusUserSave: club, league, season history, economy, scouts
  ├── VersusSeasonConfig: season, league, group, grade, club IDs
  ├── VersusBattleMiniData: fixture ID, home/away, time, score, rewards
  └── VersusBattle: two-half simulation and detailed battle summary
```

| Recovery class or field | Direct evidence in `dump.cs` | Safe interpretation |
|---|---|---|
| `VersusUser` | `UserGameStatus`, `IsInEnrollStatus`, `IsInGameStatus`, `IsInGameOverStatus`, `Login`, `Logout`, `InitUserData`, `OnTimeChanged`, async `ProcessGameProcedure`. | Versus is a separate user lifecycle with time-driven processing. |
| `VersusUserSave` | Club ID, game status, Versus money/coin, current league, last system time, season ID list/maps, season score/diff-goal dictionaries, played count, scout arrays, sponsor/exchange fields, async `ProcessSeasonMatch`, `ProcessPlayerCondition`. | Separate online economy, club identity, league history, scheduled settlement, scouting, sponsor/exchange, and condition updates. |
| `VersusSeasonConfig` | Season ID, league ID, group ID, league grade, group club IDs, creation time, and method to obtain other club IDs plus NPC IDs. | Users enter a season/group containing other clubs, with NPC fallback support. |
| `VersusBattleMiniData` | League type, battle ID, home/away IDs, home/away goals, scheduled time, state, home/away reward, embedded `BattleData`. | Compact fixture/settlement payload can be synchronized and settled by identity. |
| `VersusBattle` | Home/Away `VersusBattleClub`, battle/league/round IDs, `BeginBattle`, first half, second half, `BattleEnd`, result calculation, formation/substitute calculation, MVP, fake summary. | The client has a two-half simulated battle engine and a summary path for server-provided or synthetic results. |
| `VersusBattleClub` | Ball control, shots, shots on target, corners, yellow cards, battle award, result type, players, player dictionary, playing list, attack/defence getters, tactic/formation add-ratio hooks. | Match output contains team statistics, discipline, player participation, and tactical/formation effects. |
| `VersusClub` | Club ID/name/icon/country/grade, goals for/against, rank, score, W/D/L, diff goal, player dictionary, player names, season player statistics. | Versus is a club-based league with standings and per-player season statistics. |

## Reconstructed Versus lifecycle

The exact server sequence is not recovered, but the field/method structure supports this conservative lifecycle:

1. A user logs in or enrolls into Versus. The user receives a separate Versus club and status.
2. The user is assigned to a season, league grade, and group. Group code is supported by public release-note evidence; the exact invitation and validation rules remain unknown.
3. The user manages a Versus roster, scouts players, manages player conditions, and spends separate Versus money/coins.
4. The system creates scheduled round fixtures using home/away club IDs and a battle ID. Other user clubs may participate; NPC IDs are available as fallback in recovery.
5. A match is resolved by the two-half battle simulation or by a synchronized compact battle result. The result includes score, state, rewards, club statistics, cards, player statistics, and potentially MVP.
6. The result updates the user's season score, goal difference, rank, W/D/L, rewards, played count, and player condition. Processing is designed to be triggered by system time, so the user does not need to be online at the exact settlement moment.
7. The season transitions to a new season or league based on recovered season maps and rank/score state.

Steps 1–2 and the existence of online/group participation are supported by public metadata and recovery fields. The exact timing, matchmaking policy, real-time presence, promotion/relegation, and server authority are `RECOVERY_INFERRED`.

## Why asynchronous/server-synchronized is the safest interpretation

Several recovered fields point away from a purely live action match. `VersusBattleMiniData` stores a scheduled `Time`, final home/away goals, state, and rewards. `VersusUserSave.ProcessSeasonMatch` and `VersusUser.OnTimeChanged` indicate that settlement can be processed when system time advances. The compact payload can contain an embedded full battle object, while `VersusBattle` includes `FakeBattleSummary`, which suggests the client can display a result supplied or summarized by a server. This is compatible with an online competition whose users submit state and receive scheduled results, even if the original product also allows some live interaction.

This does not prove that real-time PvP is absent. It proves only that an asynchronous or server-synchronized path is structurally present and is the correct first implementation target for Discord.

## Recommended Discord Versus design

| Product concept | Discord implementation |
|---|---|
| Group code | `/versus group create`, `/versus group join`, owner/admin validation, maximum group size. |
| Enrollment | `/versus enroll` creates or links one Versus club per Discord user. |
| Separate economy | Separate `versusMoney`, `versusCoin`, scout budget, and settlement ledger; never reuse Player/Coach wallet directly. |
| Roster snapshot | A versioned Versus roster with player condition, lineup, formation, and tactics. |
| Fixture | Immutable `seasonId`, `leagueId`, `groupId`, `roundId`, `battleId`, home/away IDs, deadline, and state. |
| Settlement | Idempotent worker or `/versus settle` fallback using one transaction and unique `battleId`. |
| Results | Score, possession, shots, shots-on-target, corners, cards, player events, MVP, rewards, and standings. |
| Offline support | A user submits lineup/tactics before the deadline; settlement runs without both players online. |
| Anti-cheat | Server-side validation, immutable match snapshot, deterministic seed, version checks, unique settlement key, and audit log. |
| Discord privacy | Show only public club/coach data; keep internal user IDs and economic ledgers private. |

## What remains unknown

The recovery dump does not provide the original API URLs, request/response contracts, authentication, encryption keys, authoritative matchmaking algorithm, exact group-code semantics, real-time transport, or formula bodies. No original binary or proprietary payload should be copied into the repository. All new formulas and reconstructed server behavior must be labeled `RECOVERY_INFERRED`.

## References

[1]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — NamuWiki"

[2]: https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko "Football Rising Star — Korean App Store listing"

[3]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play"

[4]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store"


## Source verification notes

The Australian, French, Cameroon, and Singapore App Store listings preserve the same official Player/Coach description and version 2.8.0 metadata. The Singapore App Store screenshot is the direct visual exception: it shows three distinct main-menu entries, Player Mode, Coach Mode, and Versus Mode. The official Google Play listing also confirms version 2.8.0 updated June 12, 2026 and classifies the app listing as single-player; that category should not be interpreted as proof that the separate Versus feature is absent.

The Korean App Store release-note index is the strongest public product evidence for the online layer. It exposes wording equivalent to: group code function added in battle mode, advanced scout function added in battle mode, and player-status improvement function added in battle mode. The full App Store page may expose only the latest short note depending on locale/platform, so this wording is recorded as indexed official store metadata rather than as a complete changelog.

The current NamuWiki page explicitly states that the game has Player Mode, Director/Coach Mode, and a Battle Mode that opens after a season in Director Mode. It also documents five major European leagues, Q League, Player retirement around age 34, rebirth, and achievement criteria. NamuWiki warns that it is a community wiki, so its mode/unlock statements are corroboration rather than official server documentation.

The Naver community overview describes the product as a simulation in which the user presses the next-round control and receives a result, with position-dependent abilities, transfers, Coach formations/tactics, club targets, dismissal, and early retirement. It does not document online Versus. The additional Naver player posts corroborate long-term skill specialization, rebirth, trophies, and the importance of weekly progression, but they also do not provide a Versus lobby or protocol.

The GNGAsia listing and MWM page are third-party metadata. GNGAsia mirrors the official Player/Coach copy rather than proving online rules. MWM's visual/UX descriptions are useful for official screenshot interpretation but explicitly state that MWM is not the app developer. Soft112 and Aptoide are version mirrors; use them for version chronology only, not for authoritative battle semantics.


## Additional player and fixture schema evidence

`BattleStruct` contains `battleID`, `home`, and `away`; `RoundBattleRuleConfig` contains `roundBattleRule`, `round`, serialized `battles`, parsed `battleList`, `GetBattles(roundId)`, and `GetCLGroupBattles(seasonId, groupId, roundId)`. This provides direct schema evidence for stable fixture pairing and separate league/continental group schedules.

`VersusUserStatus` defines `IDLE = 0`, `ENEROLL = 1`, `GAME = 2`, and `GAMEOVER = 3`. The spelling of `ENEROLL` is retained from the recovered client. `VersusPlayer` persists ID, current age, property value, position, captain flag, yellow-card count, status, HP, injury type, club ID, red-card ban count, injury end time, display names, ability dictionary, initial age, and growth type. Its methods include `CanPlay`, `BeBan`, position ability scoring, total ability scoring, battle summary, HP consumption, injury setting, status change, ban clearing, yellow-card update, attack/defence calculation, and battle ratio components for age, HP, injury, and status.

This means the Versus fixture must validate not only lineup membership but also player eligibility, HP, injury end time, yellow-card accumulation, red-card ban, age/growth, position, captaincy, and current status. It also means player condition can affect match strength through multiple ratio components. The exact numeric relationship remains `RECOVERY_INFERRED` because the method bodies are absent.
