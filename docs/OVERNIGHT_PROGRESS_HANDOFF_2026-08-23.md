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
