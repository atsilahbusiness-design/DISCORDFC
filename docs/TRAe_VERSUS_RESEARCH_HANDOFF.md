# Trae A.I. Handoff — Versus Mode Research

## Mission

Build Versus Mode as a separate online multiplayer mode in DISCORDFC, not as a hidden Coach sub-feature. The authoritative evidence set is the 30-reference manifest plus the truth matrix.

## Evidence summary

The strongest evidence is the official App Store screenshot with separate Player Mode, Coach Mode, and Versus Mode buttons; Korean App Store release metadata that names group code, advanced scout, and player-status improvement in battle mode; NamuWiki's statement that Battle Mode opens after a Coach season; and dedicated recovered `Versus*` structures.

The recovery contains the following meaningful layers:

| Layer | Recovered elements | Product meaning |
|---|---|---|
| User lifecycle | `VersusUser`, `VersusUserSave`, `VersusUserStatus` | Login/enrollment/game/game-over and time-driven progression. |
| Competition | `VersusSeason`, `VersusSeasonConfig`, `VersusSeasonRoundSchedule` | Group/league/grade season and round state. |
| Fixture | `BattleStruct`, `RoundBattleRuleConfig`, `VersusBattleMiniData` | Stable battle ID, home/away pairing, schedule, state, goals, rewards. |
| Battle | `VersusBattle`, `VersusBattleClub` | Two-half battle, formation/substitutions, team stats, MVP, summary. |
| Roster | `VersusPlayer`, `VersusClub`, `VersusClubBase` | Separate player state, abilities, HP, injury, cards, bans, club roster, standings. |
| Economy | Versus money/coins, scouts, sponsors, exchange | Separate competitive economy and scouting layer. |

## Canonical product decision

Implement **asynchronous online group competition** first. Users do not need to be online simultaneously. They submit lineup, formation, tactic, captain, substitutes, and roster state before a deadline. A scheduled or manually retried worker settles the battle once, updates both sides, and publishes the result. This is online multiplayer at the group/season/settlement layer and is the most conservative interpretation of the recovered time-driven processing.

Do not label it real-time PvP until the product owner confirms it or a stronger source proves a live lobby/presence/transport model. Keep real-time PvP as P2.

## P0 implementation contract

1. Add `Mode.VERSUS` and a mode router separate from Player and Coach.
2. Add `VersusGroup`, expiring group code, owner/admin, capacity, membership, and one-club-per-user-per-group constraints.
3. Add separate `VersusUser`, `VersusSeason`, `VersusClub`, `VersusPlayer`, wallet, scout, condition, fixture, submission, settlement, standings, and audit-ledger aggregates.
4. Add commands `/versus enroll`, `/versus group create`, `/versus group join`, `/versus group status`, `/versus roster`, `/versus scout`, `/versus lineup`, `/versus tactic`, `/versus fixtures`, `/versus submit`, `/versus result`, `/versus standings`, and an admin/scheduler `/versus settle`.
5. Validate player age, position, HP, injury end, status, yellow cards, red-card ban, captain, formation slot, duplicate player, roster version, and group membership.
6. Lock a complete battle snapshot at the deadline. Store formation/tactic ruleset version and deterministic seed.
7. Simulate two halves with centralized `RECOVERY_INFERRED` coefficients for club strength, position ability, formation, tactic, captain, condition, and bounded variance.
8. Settle both clubs, player stats, cards/injury/HP, standings, and rewards in one PostgreSQL transaction.
9. Use a unique battle settlement key and ledger idempotency key so retries never duplicate results or rewards.
10. Provide NPC fallback for groups with insufficient human members and label NPC status internally.

## Acceptance tests

| Scenario | Required result |
|---|---|
| Two users join the same group | Both get unique Versus clubs in the same season. |
| Same user joins twice | Second enrollment is rejected without mutation. |
| User edits lineup before deadline | Latest valid version is accepted. |
| User edits after lock | Rejected or deferred to next round. |
| Injured/banned player submitted | Submission rejected with actionable reason. |
| Same battle settled twice | Original result returned; no duplicate ledger or standings change. |
| Two settlement workers race | One transaction wins; the other safely returns stored result. |
| User views another group's fixture | Access denied without state disclosure. |
| Human population is incomplete | NPC opponent fills the schedule without occupying a human account. |
| Ruleset changes after a battle | Historical result remains reproducible with stored ruleset version. |
| Worker crashes after Discord response defer | Retry completes settlement exactly once. |
| Season rollover | Results finalize, rewards issue once, next season state is created. |

## Deferred questions

The product owner still needs to decide: real-time versus asynchronous match presentation; private group versus public matchmaking; group capacity; round cadence; whether Versus roster is independent or can be seeded from Coach roster; promotion/relegation; human/NPC ratio; and the non-pay-to-win economy. Until these are answered, use configurable defaults and preserve historical state.

## Safety and provenance

Do not include the recovered proprietary game binary or secrets in the repository. Do not copy unknown server formulas. Use `RECOVERY_VERIFIED` for fields/classes directly observed in recovery, `PUBLIC_VERIFIED` for official store evidence, and `RECOVERY_INFERRED` for reconstructed coefficients, cadence, group capacity, promotion rules, or real-time behavior.

## Files to read first

- `docs/VERSUS_30_REFERENCE_MANIFEST.md`
- `docs/VERSUS_TRUTH_MATRIX.md`
- `docs/VERSUS_MODE_CONCEPT_SPEC.md`
- `docs/VERSUS_MODE_RECOVERY_RESEARCH.md`
- `docs/COACH_MULTIPLAYER_RECOVERY_FINDINGS.md`
