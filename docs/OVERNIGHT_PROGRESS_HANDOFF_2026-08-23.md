# Overnight Progress Handoff — DISCORDFC

**Date:** 2026-08-23
**Branch:** `main`
**Commit at start:** `f2256de`

## Work completed in this pass

The repository was verified against `origin/main` before work began. Public evidence was rechecked from the official App Store/Google Play listings, the NamuWiki gameplay reference, and a publicly indexed Football Rising Star walkthrough. The official store listings explicitly describe Player and Coach as the two documented core modes, while the community reference describes a separate match mode that unlocks after a Coach season; this is evidence of a public mode surface, not proof of the exact live-service Versus flow requested for this reconstruction. The evidence confirms the Player career loop, timed recovery/injury pressure, club/league progression, and market/battle surfaces visible in public material, but it does not disclose the original numeric formulas or official matchmaking algorithm.

The Versus Deal economy received an additional auditability improvement: when a bidder is outbid, the released reservation now emits an idempotent `BID_RELEASED` ledger event. The repository also has versioned Player formulas, deterministic calibration probes, queue tickets with TTL/rating/roster snapshots, deterministic matching, Deal reservation/expiry/settlement, PostgreSQL projection tables, and registry/schema regression guards.

## Verification

`pnpm build` passed. `pnpm test` passed with 58 tests and zero failures, including deterministic Coach reference-clock coverage. Targeted audit passed. The stress simulation completed 300 Player, 300 Coach, and 300 Versus trials with zero failed trials, invariant failures, or determinism failures. `pnpm audit --prod --audit-level=high` reported no known vulnerabilities, and the baseline secret/artifact scan found only the intended `.env.example`. `git diff --check` passed before this handoff update.

## Remaining known limitations

The original Player coefficients, MMR, queue policy, opponent selection, Scout effects, Sponsor payout/cooldown, diamond exchange, player-status boost, and the exact unlock boundary for the public match/Versus surface remain unverified. The official store pages list only Player/Coach, so no unsupported claim is made that every public video or community page represents the same current build. The current values are versioned and explicitly inferred. PostgreSQL canonical projections are present, but a separate multi-instance worker and fully canonical Versus settlement service still require deployment validation and operational design. Docker/Compose was not run because Docker is unavailable in the sandbox.

## Safety rules for the next pass

Do not import credentials, raw client archives, proprietary textures, or binary artifacts. Do not count Player/Coach career videos as Versus evidence. Do not promote synthetic calibration probes to official formulas. Before any push, rerun build, all tests, targeted audit, stress simulation when domain code changes, dependency audit, diff check, and a secret/artifact path scan.

## Evidence references

The public evidence used in this pass is limited to the [official App Store listing](https://apps.apple.com/us/app/football-rising-star/id1585604439), the [official Google Play listing](https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US), the [NamuWiki gameplay reference](https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80), and the [publicly indexed walkthrough](https://www.youtube.com/watch?v=hBakdDdTCQw). These sources are used only to label observed surfaces and uncertainty boundaries; they are not treated as authoritative sources for hidden server formulas.
