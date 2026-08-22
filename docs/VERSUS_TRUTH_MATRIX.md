# Versus Mode — Truth Matrix

**Date:** 2026-08-22  
**Reference corpus:** 30 inputs listed in `VERSUS_30_REFERENCE_MANIFEST.md`.

## Reading the matrix

`PUBLIC_OFFICIAL` means the claim appears in an official listing, release metadata, or official screenshot. `PUBLIC_COMMUNITY` means a community wiki or player report and may be incomplete or biased. `VIDEO_CONTEXT` means the video documents adjacent Player/Coach gameplay but does not prove a Versus-specific rule. `RECOVERY_SCHEMA` means the IL2CPP dump exposes a class, field, or method signature; it is strong evidence of client-side state but not proof of server behavior. `RECOVERY_INFERRED` means a design reconstruction needed for DISCORDFC where the method body, server payload, or authoritative formula is absent.

| ID | Claim | Evidence | Confidence | DISCORDFC decision |
|---:|---|---|---|---|
| T-01 | Versus is a separate mode entry point. | Official App Store screenshot shows Player Mode, Coach Mode, and Versus Mode buttons. [4] | High | Use a separate `/versus` command namespace and mode context. |
| T-02 | Battle mode has group-code functionality. | Korean App Store release-note metadata indexes group-code addition in battle mode. [5] | High | Implement group create/join by expiring code. |
| T-03 | Battle mode has advanced scouting. | Korean App Store release-note metadata indexes advanced scout addition. [5] | High | Keep scout state and refresh counters in Versus aggregate. |
| T-04 | Battle mode has player-status improvement. | Korean App Store release-note metadata indexes player-status improvement. [5] | High | Model condition/HP/status as a competitive preparation system. |
| T-05 | Battle mode unlocks after completing a Coach season. | NamuWiki Korean/English community pages. [7] [8] | Medium | Make unlock configurable; default to completing one Coach season or admin-enabled beta. |
| T-06 | Versus user state has lifecycle statuses. | `VersusUserStatus`: IDLE, ENEROLL, GAME, GAMEOVER. [23] | High | Normalize `ENEROLL` to `ENROLLED` in new code but preserve migration mapping. |
| T-07 | Versus state is time-driven and can process matches asynchronously. | `OnTimeChanged`, `LastSysTime`, `ProcessSeasonMatch`, `ProcessPlayerCondition`. [24] | High | Build scheduled/asynchronous settlement first. |
| T-08 | Versus has separate user save state, economy, club, season maps, scores, and goal dictionaries. | `VersusUserSave`. [24] | High | Isolate Versus state and wallets from Player/Coach. |
| T-09 | Versus has season/league/group/grade configuration. | `VersusSeasonConfig`. [25] | High | Implement group-scoped seasons and configurable league grades. |
| T-10 | The season can provide other clubs excluding the user's club. | `GetOtherLeagueClubIdsExceptMySelf`-type recovery behavior and season group IDs. [25] | High | Provide NPC fallback without pretending NPCs are humans. |
| T-11 | Fixture identity includes battle ID, home, and away. | `BattleStruct`: battleID, home, away. [30] | High | Use stable unique battle IDs and home/away fixture rows. |
| T-12 | Round rules can return normal and CL/group battles. | `RoundBattleRuleConfig`, `GetBattles`, `GetCLGroupBattles`. [30] | High | Separate league and continental round schedules. |
| T-13 | A compact battle payload stores scheduled time, state, score, rewards, and embedded battle data. | `VersusBattleMiniData`. [26] | High | Store deadline/state/result/reward fields and immutable payload hash. |
| T-14 | Battle is split into two halves. | `VersusBattle`: BeginBattle, FirstHalf, SecondHalf, BattleEnd. [27] | High | Simulate two half phases; expose halftime state in result. |
| T-15 | Battle resolves formation and substitutions. | Formation/substitute methods in `VersusBattle`. [27] | High | Lock XI/substitutes and apply ruleset-based substitutions. |
| T-16 | Battle produces MVP and summary output. | MVP/result/summary methods in `VersusBattle`; official screenshots show post-match detail in adjacent modes. [27] [20] | High for output shape | Include MVP and full summary; formula remains inferred. |
| T-17 | Team output includes ball control, shots, shots on target, corners, cards, awards, and player lists. | `VersusBattleClub`. [28] | High | Include all fields in settlement and result embed. |
| T-18 | Standings include score/rank, goals, W/D/L, and goal difference. | `VersusClub` and `VersusUserSave` dictionaries. [24] [29] | High | Implement standings with configurable tie-break rules. |
| T-19 | Versus player state includes age, position, captain, HP, injury, cards, bans, ability map, and growth type. | `VersusPlayer`. [29] | High | Validate all eligibility fields at submission and settlement. |
| T-20 | Player battle strength is affected by age, HP, injury, and status ratios. | `AgeRatio`, `HPRatio`, `InjuryRatio`, `StatusRatio`, `GetBattleRatio`. [29] | High for components | Use centralized inferred coefficients; do not copy unknown numeric values. |
| T-21 | Versus supports player condition processing after a match/time change. | `ProcessPlayerCondition`, injury end time, HP and status fields. [24] [29] | High | Apply condition and injury updates atomically with settlement. |
| T-22 | Versus has a two-sided battle with home and away clubs. | `VersusBattle`, `VersusBattleClub`, `VersusBattleMiniData`. [26] [27] [28] | High | Require both sides, snapshots, and paired settlement. |
| T-23 | Versus has a group/season competition rather than only isolated matches. | Group code public evidence and `VersusSeason`/`VersusSeasonConfig`. [5] [7] [25] | High | Implement season rounds, table, rollover, and history. |
| T-24 | Versus online behavior is asynchronous or server-synchronized. | Time-driven save processing and no recovered live-lobby/presence signatures. [24] [26] | Medium-high | Build offline-safe scheduled rounds; label as product adaptation. |
| T-25 | Real-time simultaneous PvP is the original behavior. | No direct public/recovery proof. | Low | Defer until user/product confirmation or stronger evidence. |
| T-26 | The original server formula can be reproduced exactly. | Dump signatures have no method bodies/server implementation. | Low | Use deterministic `RECOVERY_INFERRED` formula with ruleset version. |
| T-27 | Versus can use the Coach roster directly. | No authoritative field proves shared roster identity; `VersusUserSave` is separate. [24] | Low | Keep separate by default; allow explicit seeded import only if product approves. |
| T-28 | Group code defines exact capacity and expiry. | Group-code feature is public, but exact constraints are not exposed. [5] | Low | Make capacity/expiry configuration knobs. |
| T-29 | Promotion/relegation rules are known. | League/grade fields exist; complete rule body is absent. [25] [29] | Low | Implement configurable grade rollover, not hard-coded claims. |
| T-30 | Versus rewards include side rewards and economy actions. | Mini battle side reward fields; Versus save coin/money/scout/sponsor/exchange state. [24] [26] | High for existence | Use auditable ledger and configurable non-pay-to-win reward caps. |

## Operational conclusions

The first implementation should trust T-01 through T-04, T-06 through T-23, and T-30 as the core product contract. It should treat T-05 as a configurable unlock. It should implement T-24 as a safe adaptation rather than claim a definitive original network model. It should not implement T-25, T-26, T-27, T-28, or T-29 as fixed “original” behavior.

The minimum viable online loop is:

```text
create/join group
  → assign Versus club
  → prepare roster and condition
  → choose XI, captain, substitutes, formation, tactic
  → submit before round deadline
  → lock both snapshots
  → run deterministic two-half battle
  → settle both clubs in one transaction
  → update player condition/cards, standings, rewards, and history
  → notify users and open next round
```

## References

[4]: https://apps.apple.com/sg/app/football-rising-star/id1585604439?platform=tv "Football Rising Star — Singapore App Store screenshots"

[5]: https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko "Football Rising Star — Korean App Store release metadata"

[7]: https://namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football Rising Star — NamuWiki Korean"

[8]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football Rising Star — NamuWiki English mirror"

[20]: https://www.youtube.com/watch?v=UTpBYprcDgM "Football Rising Star Player career video"

[23]: `dump.cs` TypeDefIndex 543, `VersusUserStatus`

[24]: `dump.cs` TypeDefIndex 1014/1015, `VersusUserSave` and `ProcessSeasonMatch`

[25]: `dump.cs` TypeDefIndex 902, `VersusSeasonConfig`

[26]: `dump.cs` TypeDefIndex 906, `VersusBattleMiniData`

[27]: `dump.cs` TypeDefIndex 906/905, `VersusBattle`

[28]: `dump.cs` TypeDefIndex 905, `VersusBattleClub`

[29]: `dump.cs` TypeDefIndex 907/913, `VersusPlayer` and `VersusClub`

[30]: `dump.cs` TypeDefIndex 447–449, `BattleStruct` and `RoundBattleRuleConfig`
