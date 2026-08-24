# Overnight Progress Handoff — DISCORDFC

**Date:** 2026-08-23
**Branch:** `main`
**Commit at start:** `73d05c7`

## Work completed in this pass

The repository was verified against `origin/main` before work began. Public evidence was rechecked from the official App Store/Google Play listings, the NamuWiki gameplay reference, and a publicly indexed Football Rising Star walkthrough. The official store listings explicitly describe Player and Coach as the two documented core modes. A regional App Store listing for version 2.8.0 also confirms that a battle-mode surface exists in release history, but its current extracted release notes only say that bugs were fixed; this is evidence of a public battle surface, not proof of the exact live-service Versus flow requested for this reconstruction. The evidence confirms the Player career loop, timed recovery/injury pressure, club/league progression, and market/battle surfaces visible in public material, but it does not disclose the original numeric formulas or official matchmaking algorithm.

The Versus Deal economy received an additional auditability improvement: when a bidder is outbid, the released reservation now emits an idempotent `BID_RELEASED` ledger event. The repository also has versioned Player formulas, deterministic calibration probes, queue tickets with TTL/rating/roster snapshots, deterministic matching, Deal reservation/expiry/settlement, PostgreSQL projection tables, and registry/schema regression guards. In this pass, audit found a stale unused `createVersusClub` import in the Discord handler and removed it. Stress replay then exposed Coach nondeterminism in job acceptance and season settlement because those paths created fresh `MathRandomSource` instances; optional seeded RNG injection now carries the harness RNG through `acceptJobOffer`, `finishSeason`, and `settleCoachSeason`. No gameplay coefficients were changed.

## Verification

`pnpm build` passed. `pnpm test` passed with 58 tests and zero failures, including deterministic Coach reference-clock coverage. Targeted audit passed. After carrying seeded RNG through Coach job and season transitions, the final stress simulation completed 300 Player, 300 Coach, and 300 Versus trials with 115,770 total actions and zero failed trials, invariant failures, or determinism failures. `pnpm audit --prod --audit-level=high` reported no known vulnerabilities, and the baseline secret/artifact scan found only the intended `.env.example`. `git diff --check` passed before this handoff update. The working tree contains only the changes described in this pass and is ready for final guarded commit.

## Remaining known limitations

The original Player coefficients, MMR, queue policy, opponent selection, Scout effects, Sponsor payout/cooldown, diamond exchange, player-status boost, and the exact unlock boundary for the public match/Versus surface remain unverified. The official store pages list only Player/Coach, so no unsupported claim is made that every public video or community page represents the same current build. The current values are versioned and explicitly inferred. PostgreSQL canonical projections are present, but a separate multi-instance worker and fully canonical Versus settlement service still require deployment validation and operational design. Docker/Compose was not run because Docker is unavailable in the sandbox.

## Safety rules for the next pass

Do not import credentials, raw client archives, proprietary textures, or binary artifacts. Do not count Player/Coach career videos as Versus evidence. Do not promote synthetic calibration probes to official formulas. Before any push, rerun build, all tests, targeted audit, stress simulation when domain code changes, dependency audit, diff check, and a secret/artifact path scan.

## Evidence references

The public evidence used in this pass is limited to the [official App Store listing](https://apps.apple.com/us/app/football-rising-star/id1585604439), the [official Google Play listing](https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US), the [NamuWiki gameplay reference](https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80), and the [publicly indexed walkthrough](https://www.youtube.com/watch?v=hBakdDdTCQw). These sources are used only to label observed surfaces and uncertainty boundaries; they are not treated as authoritative sources for hidden server formulas.

## Final state for this pass

The previous guarded commit was `b18b614`; this pass adds a deterministic Coach job-acceptance regression test and refreshes stress artifacts. The current pending change covers 59 tests, seeded Coach replay, and the evidence boundary for battle mode. No gameplay coefficients were changed, and Scout/Sponsor remain unimplemented beyond evidence-safe preview behavior.

— Manus AI

## Evidence update for this pass

A regional App Store listing for version 2.8.0 was checked directly. It confirms the current public listing and generic bug-fix release note, while indexed release metadata continues to indicate group-code, advanced-scout, and player-status additions in battle mode. The matrix now labels those claims as high-confidence existence evidence but low-confidence rule evidence. No Scout, Sponsor, status-boost, or matchmaking coefficients were added.

— Manus AI

## Latest pass note

The remaining Coach stress mismatch was traced to `settleCoachSeason` calling `ensureCoachClubState` without the seeded RNG. The fix now forwards the optional RNG through that preparation step. A regional App Store listing for version 2.8.0 was checked directly; it confirms the public release but exposes only generic bug-fix notes, so group-code/Scout/status claims remain existence evidence rather than cost/effect rules. The Versus truth matrix was updated accordingly.

Latest verification: build PASS; 59 tests PASS; targeted audit PASS; 300 trials per mode PASS; 115,770 actions; zero invariant and determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest determinism hardening

The final Coach replay mismatch was traced to `createCoachCareer` initializing the Coach club through the default `MathRandomSource`. `createCoachCareer` now accepts an optional `RandomSource`, and the stress harness supplies a seeded generator. This is a correctness/replay improvement only; no original gameplay coefficient was invented or changed.

Final verification after the fix: build PASS; 59 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Evidence boundary clarification

Direct extraction of the regional App Store pages for version 2.8.0 shows only the generic release note “Fixed several bugs.” Search-index snippets that mention group code, advanced Scout, or player-status improvement were not treated as independently verified gameplay rules. They remain corroborating metadata only; no implementation of their costs, cooldowns, payouts, or effects is justified.

— Manus AI

## Latest parity hardening

Public version history reports that Versus was added in version 2.0.0, and that group code, advanced Scout, and player-status improvement were added to battle mode in version 2.1.0; this history confirms feature existence but not hidden server rules. The repository therefore keeps group-code/matchmaking and preview surfaces while leaving Scout/status mutation coefficients unimplemented. A regression test now locks the existing deterministic Versus standings tie-break: points, goal difference, goals scored, then stable club ID.

Latest verification: build PASS; 60 tests PASS; targeted audit PASS; 300 trials per mode PASS; 115,770 actions; zero invariant and determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest safe UX parity improvement

The Versus Global Ranking embed previously re-sorted standings with only points and goal difference, which could disagree with the canonical standings tie-break when goals scored or club ID decided a tie. It now renders `getVersusStandings()` directly, preserving the canonical rank and limiting the display to the same top-eight surface. This changes presentation consistency only; it does not add a new competitive formula.

Relevant public version history was rechecked through Apptopia. It records Versus as added in version 2.0.0, battle group code/advanced Scout/player-status improvement in version 2.1.0, and Versus ranking optimization in version 2.0.34. These are feature-history signals only; hidden matchmaking, economic, and ranking coefficients remain unverified.

Latest verification: build PASS; 60 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest safe UX correction

The Versus Market embed previously labeled the total wallet balance as “Available coin” while also showing reservations. It now uses `availableVersusCoin(profile)` and displays available, total, and reserved amounts separately. This fixes a user-facing accounting label without changing auction rules or introducing unsupported economics.

Public evidence was rechecked through Apptopia’s version history and official App Store listings. The history supports existence of Versus/battle surfaces, group code, advanced Scout, player-status improvement, and ranking optimization; it does not expose authoritative costs, cooldowns, payouts, MMR, or hidden formulas. Those remain explicitly out of scope for invention.

Latest verification: build PASS; 60 tests PASS; targeted audit PASS; 300 trials per mode PASS; 115,770 actions; zero invariant and determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest safe UX correction

The Versus Market embed now distinguishes available coin from total wallet coin and reserved escrow. It calls `availableVersusCoin(profile)` instead of presenting the total wallet as “Available coin”. This is a presentation/accounting correction only and does not alter auction rules or introduce unsupported economics.

The relevant public evidence was rechecked through Apptopia’s version history and the official App Store listing. The public history records Versus in version 2.0.0, group code/advanced Scout/player-status improvements in version 2.1.0, and Versus ranking optimization in version 2.0.34. The current official listing shows version 2.8.0 with generic bug-fix notes. These sources support feature existence/history only; MMR, costs, cooldowns, payouts, and hidden formulas remain unverified and are not invented.

Latest verification: build PASS; 60 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest deterministic Club hardening

A residual RNG leak was found in Club helper paths that initialize missing state: formation mutation, tactic mutation, next-fixture lookup, and standing formatting each created a fresh `MathRandomSource`. Each helper now accepts an optional seeded `RandomSource` while preserving all existing call signatures and default behavior. This closes a replay gap when Coach/Club state is first materialized through those paths; it does not change gameplay coefficients or outcomes for existing stored state.

Latest verification: build PASS; 61 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest deterministic standings hardening

The Club standing formatter previously stopped tie-breaking after points and goal difference. It now follows the deterministic order used by Versus standings: points, goal difference, goals scored, then stable club ID. A regression test covers equal-stat rows. The test initially exposed a missing import and an incorrect newline literal; both were corrected before final verification. No competitive formula was changed.

Latest verification: build PASS; 62 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest Coach rebirth hardening

A residual RNG leak was found in `rebirthCoach`: rebuilding the Coach club used a fresh `MathRandomSource`, so two replays with the same intended seed could produce different rosters. `rebirthCoach` now accepts an optional seeded `RandomSource` and forwards it to `ensureClubState`; a regression test covers identical rebuilt roster and fixtures for identical seeds. Existing callers retain default behavior, and no rebirth bonus or gameplay coefficient changed.

Latest verification: build PASS; 63 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest Champions League determinism hardening

A remaining initialization gap was found in the Champions League path: `playChampionsLeague` accepted a seeded RNG, but `startChampionsLeague` materialized a missing Club state with a fresh default RNG. `startChampionsLeague` now accepts an optional `RandomSource`, and the play path forwards the same RNG. Existing callers retain their previous argument order and default behavior; no competition coefficient or reward was changed.

Latest verification: build PASS; 63 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest Champions League replay hardening

The Champions League start path now accepts and forwards the same optional seeded `RandomSource` already used by match simulation. This prevents a missing Club/Coach state from being initialized with an unrelated default RNG before a seeded match begins. Existing callers retain their argument order and defaults; no coefficient, qualification rule, reward, or formula was changed.

Direct public evidence was rechecked through the official App Store listing and Apptopia version history. The evidence supports historical battle/Versus surfaces and fixes for ranking inconsistency, transfer-market profit abuse, battle freezes, season dismissal, and missing Versus assets. It does not disclose server formulas, MMR, costs, cooldowns, or payout rules, so those remain unimplemented unless separately verified.

Latest verification: build PASS; 63 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Latest Player transfer-market determinism hardening

The Player transfer-market buy and sell helpers now accept an optional seeded `RandomSource` and forward it when they materialize missing Club state. Existing callers retain their argument order and default behavior. Prices, market availability, roster limits, and economy rules were not changed; this only closes a replay gap for first-time state initialization.

Direct evidence was rechecked through the official App Store listing and Apptopia version history. Public metadata supports battle/Versus feature history and historical fixes, but does not disclose server formulas, MMR, transfer prices, cooldowns, or payout rules. Those remain unimplemented unless independently verified.

Latest verification: build PASS; 63 tests PASS; targeted audit PASS; stress simulation PASS for 300 trials per mode with 115,770 actions and zero invariant or determinism failures; dependency audit clean; secret/artifact guard clean.

— Manus AI

## Audit-only checkpoint after `40c2873`

The latest main baseline was refreshed and found clean. Public evidence was rechecked through the official App Store listing and Apptopia version history, with focus on battle/Versus history and historical fixes for ranking consistency, transfer-market profit abuse, battle freezes, season dismissal, and missing Versus assets. No new server formula, MMR rule, price, cooldown, payout, or Scout/Sponsor effect was exposed.

No production change was made in this checkpoint because the current deterministic RNG hardening and available-coin UX are already present on main, and adding unsupported behavior would reduce parity confidence. Verification remained green: build PASS; 63 tests PASS; dependency audit clean; diff and secret/artifact guards clean. The canonical 300-trial stress result remains 115,770 actions with zero invariant and determinism failures.

— Manus AI
