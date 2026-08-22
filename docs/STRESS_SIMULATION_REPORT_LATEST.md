# DISCORDFC Stress Simulation Report

Generated: 2026-08-22T07:05:33.990Z

Result: **PASS**

The harness executed **25 trials per mode**, with 60 Player weeks per trial, 2 Coach seasons per trial, and Versus capacity 8. Total domain actions: **9562**.

| Mode | Trials | Successful | Failed | Actions | Invariant checks | Invariant failures | Determinism checks | Determinism failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PLAYER | 25 | 25 | 0 | 4572 | 1525 | 0 | 25 | 0 |
| COACH | 25 | 25 | 0 | 4390 | 1950 | 0 | 25 | 0 |
| VERSUS | 25 | 25 | 0 | 600 | 700 | 0 | 25 | 0 |

## Aggregated metrics

### PLAYER

- **awards:** 150
- **cultureStudies:** 100
- **draw:** 571
- **draws:** 0
- **injuries:** 115
- **loss:** 360
- **losses:** 0
- **matches:** 1452
- **trainingOrders:** 1405
- **weeks:** 1500
- **win:** 521
- **wins:** 0

### COACH

- **boardFailures:** 0
- **boardSuccesses:** 50
- **draw:** 579
- **draws:** 0
- **events:** 1080
- **halftimeChecks:** 1900
- **loss:** 860
- **losses:** 0
- **offers:** 0
- **rounds:** 1900
- **seasons:** 50
- **win:** 461
- **wins:** 0

### VERSUS

- **battles:** 1400
- **halftimeChecks:** 1400
- **publishedBattles:** 1400
- **rewards:** 200
- **rounds:** 350
- **standingsChecks:** 350

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
