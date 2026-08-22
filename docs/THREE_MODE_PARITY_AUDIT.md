# Three-Mode Parity Audit

**Date:** 2026-08-22  
**Scope:** Active DISCORDFC source versus Football Rising Star research/recovery evidence.

## Executive finding

The repository currently has a strong Player expansion, a useful but synthetic Coach/club foundation, and no implemented Versus multiplayer aggregate. The research is now strong enough to implement a high-fidelity reconstruction, but the current source should not be described as parity-complete. The largest technical gap is not the battle formula; it is that Coach and Versus state are not yet modeled as the multi-club, mode-isolated structures exposed by recovery.

## Current source versus target

| Area | Current source | Target parity | Priority |
|---|---|---|---:|
| Player creation | Starts age 15 with detailed initial skills and legacy six macro abilities. | Preserve age 15, position presets, detailed skills, weekly career state, and migration. | P1 |
| Player match | Simulates one personal opponent with old macro rating; queues manual EXP through the expansion path. | Use detailed skill/position/condition-aware match inputs and preserve original weekly/post-match decisions. | P1 |
| Player progression | Detailed training, manual EXP, injury, trainers, culture, tricks, awards, retirement, rebirth exist. | Calibrate against recovered config and preserve event/season cadence. | P1 |
| Coach roster | Embedded inside `PlayerProfile.clubState`; includes the user player, recovered players, and generated NPCs. | Separate Coach career and managed club aggregate with persistent squad, staff, objectives, jobs, and season history. | P0 |
| Coach fixture | `buildFixtures` uses a fixed recovered primary-club name list, but match opponent strength is synthetic and only the user's aggregate is mutated. | Resolve both club aggregates from dynamic recovery/config data and settle the whole competition. | P0 |
| Coach season | `finishSeason` uses hard-coded point thresholds and qualification rules. | Use configurable/recovered league and competition rules; preserve final standings/history. | P0 |
| Coach competitions | Champions League engine uses a fixed opponent array and linear round counter. | Use recovered round/league/CL rules and structured fixtures. | P1 |
| Versus mode | No separate `VersusUser`, `VersusSeason`, `VersusClub`, `VersusPlayer`, battle, or settlement aggregate in TypeScript. | Implement separate online group/season/league with many clubs, round schedule, battle snapshots, settlement, standings, and rewards. | P0 |
| Persistence | One JSONB `PlayerProfile` row per user; JSON fallback has the same contract. | Add mode namespaces/aggregates and shared competition rows with optimistic concurrency and transactions. | P0 |
| Discord UX | Legacy top-level commands and Player/Coach controls; no `/versus` command namespace. | Explicit mode context and owner/version-bound Versus commands/components. | P0 |
| Balance provenance | Centralized balance and `RECOVERY_INFERRED` source marker. | Extend with per-mode ruleset version; store ruleset version on every historical battle. | P1 |

## Concrete blockers

### Coach blocker

`src/domain/club-engine.ts` currently builds fixtures from a fixed `CLUB_NAMES` list and creates standings for every name, but `playClubMatch` generates only a synthetic opponent rating. The opponent's actual club roster, formation, tactic, condition, and budget are not loaded or mutated. This cannot produce a true multi-club season because the engine is modeling one managed club against a fictional rating stream.

### Versus blocker

`src/domain/types.ts` contains Player/Coach-era structures but no first-class Versus structures. The recovered client exposes separate online state, so continuing to reuse `PlayerProfile.clubState` would cause wallet, roster, version, and fixture collisions. Versus requires its own aggregate, or a storage namespace with the same isolation guarantees.

### Persistence blocker

`PostgresPlayerStore` is intentionally a one-profile-per-user store. It is safe for the existing career loop but cannot atomically update two user-owned clubs, a shared battle, standings, player conditions, and reward ledgers as one settlement. Add competition-specific repositories/transactions rather than overloading `PlayerProfile`.

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
8. Connect Discord commands and components with mode/group/battle/version guards.
9. Add integration tests for multi-user concurrency, duplicate settlement, stale input, full league standings, season rollover, and isolated wallets.

## Definition of parity for the next milestone

A milestone is considered high-fidelity when a guild can run independent Player and Coach careers while multiple users join one Versus group, each receive one distinct club, submit a legal roster and tactic, participate in round fixtures against the entire configured club list, receive one immutable settlement, and observe a correct shared standings table. It is not necessary to reproduce the original server protocol or real-time client transport to meet this gameplay milestone.

## Provenance labels

Use `PUBLIC_OFFICIAL` for App Store/Google Play evidence; `PUBLIC_COMMUNITY` for NamuWiki and player reports; `RECOVERY_VERIFIED` for fields/classes/method signatures directly visible in `dump.cs`; `WALKTHROUGH_OBSERVED` for video/UI behavior; and `RECOVERY_INFERRED` for coefficients, cadence, capacity, promotion rules, matchmaking, and unverified network semantics.
