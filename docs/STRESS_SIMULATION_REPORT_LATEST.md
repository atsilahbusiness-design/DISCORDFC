# DISCORDFC Stress Simulation Report

Generated: 2026-08-26T09:47:05.064Z

Result: **PASS**

The harness executed **300 trials per mode**, with 60 Player weeks per trial, 2 Coach seasons per trial, and Versus capacity 8. Total domain actions: **115770**.

| Mode | Trials | Successful | Failed | Actions | Invariant checks | Invariant failures | Determinism checks | Determinism failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PLAYER | 300 | 300 | 0 | 54637 | 18300 | 0 | 25 | 0 |
| COACH | 300 | 300 | 0 | 52733 | 23400 | 0 | 25 | 0 |
| VERSUS | 300 | 300 | 0 | 8400 | 10800 | 0 | 25 | 0 |

## Aggregated metrics

### PLAYER

- **awards:** 1800
- **cultureStudies:** 1200
- **draw:** 6998
- **draws:** 0
- **injuries:** 1373
- **loss:** 4567
- **losses:** 0
- **matches:** 17358
- **trainingOrders:** 16706
- **weeks:** 18000
- **win:** 5793
- **wins:** 0

### COACH

- **boardFailures:** 0
- **boardSuccesses:** 37
- **draw:** 7082
- **draws:** 0
- **events:** 13066
- **fullStandingsChecks:** 600
- **halftimeChecks:** 22800
- **loss:** 10162
- **losses:** 0
- **offers:** 0
- **rounds:** 22800
- **seasons:** 600
- **win:** 5556
- **wins:** 0

### VERSUS

- **battles:** 16800
- **halftimeChecks:** 16800
- **ledgerChecks:** 1200
- **publishedBattles:** 16800
- **rewards:** 2400
- **rounds:** 4200
- **standingsChecks:** 4200
- **submissions:** 1200

## Failure samples

### PLAYER

No failure samples recorded.

### COACH

No failure samples recorded.

### VERSUS

No failure samples recorded.

## Interpretation

The simulation checks domain invariants and deterministic replay of the current reconstructed ruleset. It does not prove 1:1 parity with the official Football Rising Star server because authoritative server formulas and live backend protocol are unavailable. Coefficients remain `RECOVERY_INFERRED` unless directly supported by recovery evidence.

Raw machine-readable results are stored in `stress-simulation-results.json`.
