# Three-Mode Parity Audit

**Date:** 2026-08-22  
**Scope:** Active DISCORDFC source versus Football Rising Star research/recovery evidence.

## Executive finding

The repository currently has a strong Player expansion, a separated Coach/club career aggregate, and a separate Versus multiplayer aggregate. The implementation is now a high-fidelity reconstruction with deterministic stress coverage, but it must not be described as parity-complete. The largest remaining gaps are authoritative server settlement, canonical shared Versus tables, complete recovered configuration values, and exact UI/network behavior.

## Current source versus target

| Area | Current source | Target parity | Priority |
|---|---|---|---:|
| Player creation | Starts age 15 with detailed initial skills and legacy six macro abilities. | Preserve age 15, position presets, detailed skills, weekly career state, and migration. | P1 |
| Player match | Simulates one personal opponent with old macro rating; queues manual EXP through the expansion path. | Use detailed skill/position/condition-aware match inputs and preserve original weekly/post-match decisions. | P1 |
| Player progression | Detailed training, manual EXP, injury, trainers, culture, tricks, awards, retirement, rebirth exist. | Calibrate against recovered config and preserve event/season cadence. | P1 |
| Coach roster | Separate `coachClubState`; uses recovered players plus normalized fallback depth and includes a profile-linked player snapshot. | Separate Coach career and managed club aggregate with fully recovered squad/staff/objective semantics. | P1 |
| Coach fixture | Home-away fixtures use recovered league clubs; opponent roster, formation, tactic, halftime, and standings are simulated with inferred formulas. | Resolve authoritative opponent aggregates, substitutions, staff effects, and server settlement rules. | P1 |
| Coach season | About 38 rounds and percentage thresholds are centralized but still `RECOVERY_INFERRED`; Coach season counter is isolated from Player season. | Calibrate league rules from authoritative config and preserve complete historical seasons. | P1 |
| Coach competitions | Champions League has a Coach-specific state/season/reward aggregate and `/champions mode:COACH`; bracket/formula remain inferred. | Use recovered round/league/CL rules and structured fixtures. | P1 |
| Versus mode | Separate user/club/player/season/battle aggregates with group enrollment, multi-club home-away schedule, legal lineup submission, snapshots, settlement, standings, rewards, ledger, and lifecycle. | Add authoritative server synchronization, canonical shared repository/tables, and exact ruleset calibration. | P1 |
| Persistence | Mode aggregates live in one JSONB profile row; PostgreSQL now provides optimistic CAS, atomic `saveBatch`, and advisory group lock for Versus projection writes. | Add canonical competition repositories/tables and cross-service repair/settlement workflow. | P0 |
| Discord UX | Explicit Player, Coach, and Versus commands exist. Versus onboarding now supports name/country/symbolic crest setup through `/versus-club` and an owner-bound modal before group enrollment. Versus Home exposes Home/Next Battle/Lineup/Results/Standings/Registration/Market/Rewards/Schedule/Rankings/Global Ranking/Sponsor; Market has Deal/Scout tabs; pre-match setup uses formation/tactic/position/captain/substitute selectors and a rating/attack/defence preview with owner/battle/roster-version/deadline guards. | Add expected-version guards for legacy dashboard actions, background reminders, auction bid settlement, sponsor/diamond mechanics, and richer result/fixture cards. | P1 |
| Balance provenance | Centralized balance and `RECOVERY_INFERRED` source marker. | Extend with per-mode ruleset version; store ruleset version on every historical battle. | P1 |

## Concrete blockers

### Coach blocker

`src/domain/club-engine.ts` now builds home-away fixtures from recovered clubs in the selected league and loads recovered opponent rosters/formations/tactics with normalized fallback depth. The remaining limitation is that opponent condition, substitutions, staff effects, budgets, and numeric match formulas are reconstructed rather than authoritative server behavior.

### Versus UX evidence update

An explicit Versus-only walkthrough is now available at [Footy Star Versus Mode | No Commentary | Day1](https://www.youtube.com/watch?v=V8MsDUXNl8A). It shows the three-mode selector, club creation with country/logo/name, cash/coin/energy status, Sign-up/Registered state, auction Deal listings with countdown, normal Scout, pitch lineup and formation, tactical instructions, sponsor tiers, rewards, and multi-category rankings. The review [Football Rising Star review (Android game, 2021)](https://www.youtube.com/watch?v=KQiUcv9d25c) independently shows dashboard, next match/result, lineup, match preview, Deal/Scout, sponsor, rewards, club detail, schedule, and global ranking. DISCORDFC now mirrors the corresponding navigation and preview surfaces. Exact bid costs, sponsor payout rules, Scout refresh effects, diamond spending, status boosts, and club-creation persistence remain unverified and are intentionally read-only.

### Versus blocker

`src/domain/types.ts` now contains first-class Player, Coach, and Versus structures. The current PostgreSQL projection path uses one atomic batch transaction plus an advisory lock per group, so repeated profile saves are no longer used by the Discord Versus path. The remaining persistence gap is canonical shared season/battle rows: the Versus aggregate is still embedded in user JSONB projections rather than an authoritative shared repository.

### Persistence blocker

`PostgresPlayerStore` remains fundamentally a profile store, but now exposes `saveBatch` and a group advisory-lock method that make the current Versus projection settlement atomic across member profiles. It still does not provide canonical shared season/battle tables or a repairable event-sourced settlement record. Add competition-specific repositories/transactions rather than treating profile JSONB as the long-term source of truth.

### Formula blocker

The current `engine.ts`, `club-engine.ts`, and `competition-engine.ts` use synthetic probability/strength formulas. The recovery dump gives method names and fields but not authoritative method bodies or server code. Replacing synthetic formulas with recovered inputs is justified; claiming the numeric coefficients are original is not.

## Implementation order

1. Add explicit mode context and separate `Versus` domain types.
2. Add storage interfaces for Versus groups, seasons, clubs, players, battles, submissions, settlements, standings, and economy ledger entries.
3. Refactor Coach into a managed-club aggregate so a match resolves two real club snapshots rather than a synthetic opponent rating.
4. Build Versus group enrollment and dynamic club list from season/config data; do not cap the league at four clubs.
5. Generate fixtures from `RoundBattleRuleConfig`/recovered schedules where available; use configurable fallback only when no recovery row exists.
6. Validate Versus player eligibility using HP, injury, cards, bans, position, captain, ability map, and roster version.
7. Implement two-half battle simulation and atomic settlement with a ruleset version and deterministic seed.
8. Connect Discord commands and components with mode/group/battle/version/deadline guards, including Home and pre-match setup.
9. Persist profile projections with batch transaction, distributed group locking, and idempotent reward ledger.
10. Add canonical Versus repository/tables before high-scale multi-replica operation.
11. Add integration tests for multi-user concurrency, duplicate settlement, stale input, full league standings, season rollover, and isolated wallets.

## Definition of parity for the next milestone

A milestone is considered high-fidelity when a guild can run independent Player and Coach careers while multiple users join one Versus group, each receive one distinct club, submit a legal roster and tactic, participate in round fixtures against the entire configured club list, receive one immutable settlement, and observe a correct shared standings table. It is not necessary to reproduce the original server protocol or real-time client transport to meet this gameplay milestone.

## Provenance labels

Use `PUBLIC_OFFICIAL` for App Store/Google Play evidence; `PUBLIC_COMMUNITY` for NamuWiki and player reports; `RECOVERY_VERIFIED` for fields/classes/method signatures directly visible in `dump.cs`; `WALKTHROUGH_OBSERVED` for video/UI behavior; and `RECOVERY_INFERRED` for coefficients, cadence, capacity, promotion rules, matchmaking, and unverified network semantics.
