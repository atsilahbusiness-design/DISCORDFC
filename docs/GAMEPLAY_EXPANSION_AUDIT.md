# Gameplay Expansion Audit

**Date:** 2026-08-21
**Repository:** `atsilahbusiness-design/DISCORDFC`
**Scope:** Gameplay expansion only; deployment and infrastructure were not changed.

## Delivered behavior

The bot now initializes new Player profiles at age 15 and stores twelve detailed skills alongside the existing six macro stats. Legacy profiles migrate lazily through `ensureGameplayState`, which fills missing gameplay fields without discarding money, clubs, contracts, markets, achievements, or ledger data.

The new pure domain module `src/domain/gameplay-engine.ts` implements detailed skill training, manual match EXP allocation, weekly progression, injury treatment, observed trick training, personal trainers, culture study, Hall of Honor records, annual World Footballer state, retirement, and rebirth. The Discord adapter exposes these behaviors through slash commands and new component flows while preserving legacy command names and owner-bound component checks.

## Verification results

| Gate | Result | Notes |
|---|---:|---|
| TypeScript build | PASS | `pnpm build` succeeds under strict TypeScript. |
| Existing tests | PASS | All prior tests continue to pass. |
| New gameplay tests | PASS | Detailed skills, migration, EXP allocation, trick, trainer/week/award, injury, retirement, and rebirth are covered. |
| Total tests | PASS | 30 tests passed, 0 failed. |
| Balance snapshot | GENERATED | `docs/BALANCE_SNAPSHOT_GAMEPLAY_EXPANSION.md` records the existing deterministic 1,000-run per-position baseline. |
| Diff whitespace check | PASS | `git diff --check` succeeds. |
| Credential/artifact scan | PASS | No token pattern, database credential assignment, API key, large binary, or tracked game archive found in the repository scan. |

## Balance observations

The existing deterministic baseline remains asymmetric by design: Forward has the highest win rate and average rating, while Goalkeeper and Defender have lower scoring and higher draw/loss shares. This is a calibration baseline, not an official game formula. The new weekly, injury, trainer, culture, and award knobs are centralized in `src/config/game-balance.ts` and marked `RECOVERY_INFERRED`.

The new weekly loop intentionally blocks the next weekly transition while match EXP remains unassigned. This enforces the manual post-match allocation behavior observed in the walkthrough and prevents a hidden automatic skill allocation. Discord treatment replaces the original advertisement/premium flow with explicit bot currency and transparent duration reduction; it should not be described as monetization parity.

## Known limitations

The client recovery dump confirms field schemas but does not expose method bodies or a reliable decryption path for all gameplay payloads. Numeric ratios, trainer values, injury chance, level curves, event effects, and World Footballer candidate scores are therefore implementation hypotheses. They must remain centralized and labeled `RECOVERY_INFERRED` until the company provides authoritative configuration or additional validated captures.

Coach mode is still a compatibility boundary rather than a complete second career loop. Existing club formation, tactics, fixtures, market, and Champions League systems remain usable, and the recovery audit confirms separate Coach configuration classes. A future Coach expansion should add Coach identity, events, trainers, honors, season goals, and job/retirement state without silently reusing Player-only assumptions.

The legacy `/match` command remains available for compatibility and now adds EXP to the pending allocation pool. Users who adopt `/next-week` should use `/assign-exp` before starting another week. A future cleanup can make `/match` a strict alias of the weekly transition after all existing profiles have migrated.

## Files changed or added

| File | Purpose |
|---|---|
| `src/domain/types.ts` | Additive domain schema, labels, catalogs, macro derivation, and compatibility helpers. |
| `src/domain/engine.ts` | Age-15 initialization, detailed-skill seed, retirement/injury guard, and pending match EXP. |
| `src/domain/gameplay-engine.ts` | Pure gameplay expansion engine. |
| `src/config/game-balance.ts` | Centralized recovery-inferred balance knobs. |
| `src/discord/commands.ts` | New slash command definitions. |
| `src/discord/handlers.ts` | New command dispatch, embeds, treatment and progression responses. |
| `src/discord/components.ts` | Detailed skill select and separate gameplay dashboard controls. |
| `test/gameplay-expansion.test.ts` | New deterministic gameplay tests. |
| `test/components.test.ts` | Regression coverage for twelve-skill component. |
| `docs/GAMEPLAY_RESEARCH_SOURCES.md` | Public and recovery research evidence. |
| `docs/GAMEPLAY_GAP_ANALYSIS.md` | Gap analysis and acceptance contract. |
| `docs/GAMEPLAY_EXPANSION_DESIGN.md` | Design and command specification. |
| `docs/recovery_*_signatures.txt` | Working extracts of recovery class/state signatures. |
| `docs/BALANCE_SNAPSHOT_GAMEPLAY_EXPANSION.md` | Fresh deterministic baseline. |

## Handoff prompt for Trae A.I.

Continue from the gameplay expansion commit. Treat `docs/GAMEPLAY_GAP_ANALYSIS.md` and `docs/GAMEPLAY_EXPANSION_DESIGN.md` as the contract. Preserve `RECOVERY_INFERRED` labels, do not add proprietary binaries or secrets, and do not claim 1:1 parity. The next high-value work is Coach mode parity, data-driven event/trainer/honor catalogs after authoritative payload decoding, and making `/match` converge fully on the canonical `/next-week` transition.
