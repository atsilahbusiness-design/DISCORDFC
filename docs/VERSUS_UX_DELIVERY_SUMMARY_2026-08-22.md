# Versus UX Delivery Summary — 2026-08-22

## Tujuan

Dokumen ini merangkum penelusuran dan remediation UX Versus DISCORDFC setelah permintaan untuk memprioritaskan footage Versus, bukan video Player Career atau Coach Career. Targetnya adalah merekonstruksi hierarchy dan flow yang terlihat pada Football Rising Star dengan komponen Discord, tanpa menganggap judul pencarian atau video game lain sebagai bukti.

## Hasil penelusuran

Indeks YouTube mencakup 54 result rows dan 47 video ID unik dari variasi kata kunci English, Indonesian, dan Chinese. Lima belas hasil memuat token `Versus`, `battle`, atau `对战`, tetapi sebagian besar ternyata berasal dari game lain, konten umum, atau judul yang hanya menggunakan kata “battle”. Video Football Rising Star yang berlabel career dikeluarkan dari evidence Versus.

Dua sumber utama yang lolos verifikasi visual adalah video dedicated `Footy Star Versus Mode | No Commentary | Day1` dan segmen Versus pada `Football Rising Star review (Android game, 2021)`.[1] [2] Sumber pertama memperlihatkan first-time club setup, country/logo/name, dashboard resources, registration, auction market, Scout, lineup, formation, tactics, sponsor, rewards, dan rankings. Sumber kedua memperlihatkan dashboard, next match, latest result, lineup, match preview, Deal/Scout, sponsor, rewards, club detail, My Schedule, dan Global Ranking.

> Video karier tidak dihitung sebagai evidence Versus. Search-result quantity juga tidak dihitung sebagai screen evidence sebelum video dibuka dan frame-nya diverifikasi.

## UX yang sekarang diimplementasikan

| Evidence surface | Implementasi DISCORDFC |
|---|---|
| Three-mode selector dan Versus entry | Versus Mode tetap aggregate terpisah dan dapat dibuka melalui mode control/dashboard. |
| Automatic assignment / assigned-team dashboard | Membuka `/versus-profile` atau tombol Versus Home memicu assignment system-managed bila belum ada; Versus Home menampilkan assigned team, group, season, round, record, rank, wallet, next battle, deadline, dan submission state. Internal `VersusClub` tetap hanya aggregate domain/recovery. |
| Matchmaking / Registration / Sign-up | System matchmaking menugaskan team dan competition; `/versus-join` tetap tersedia sebagai private-group fallback. Registration surface menampilkan group code, competition, capacity, season state, assigned team, round, dan next action. |
| Market / Deal / Scout | Home memiliki Market, Market memiliki tab Deal/Scout, dan roster/valuation ditampilkan sebagai read-only preview. |
| Next match / preview | Next Battle membuka pre-match preview dengan opponent, estimated club rating, attack/defence, deadline, roster version, formation, dan tactic. Nilai rating ditandai `RECOVERY_INFERRED`. |
| Pitch lineup | Formation select, tactic select, position-group XI selectors, captain, substitutes, review, dan confirm submission tersedia melalui Discord components. |
| Tactical instructions | Tactic choices memakai catalogue domain yang sama dan menampilkan label yang selaras dengan observed terms seperti Counter Attack, Middle Thrust, Tiki-Taka, Long Ball, Offense Full, dan Defense Full. |
| Sponsor | Sponsor surface menampilkan Junior/Senior/Top Sponsor dan balance sebagai preview. Claim/payout belum dimutasi. |
| Rewards | Rewards surface menampilkan final reward jika sudah published serta Versus ledger history jika tersedia. |
| Rankings | Ranking surface menyediakan Club, MVP, Top Scorers, Top Assists, dan Goalkeepers tabs. Saves/GK telemetry yang belum recovered tidak dibuat-buat. |
| Schedule / Global Ranking | Schedule menampilkan fixture tersimpan; Global Ranking menampilkan season-wide standings dengan batasan bahwa cross-season server ranking belum tersedia. |
| Result / standings | Results, two-half settlement, statistics, MVP, reward ledger, dan standings tetap memakai domain settlement yang sudah diuji. |

## Verification

| Check | Result |
|---|---|
| TypeScript build | PASS |
| Regression tests | 55 passing, 0 failing |
| Targeted audit | PASS |
| Production dependency audit | No known vulnerabilities |
| Diff whitespace | PASS |
| Prior deterministic stress evidence | 300 trials per mode; 115,770 actions; 1,200 legal Versus submissions; 1,200 ledger checks; 0 invariant/determinism failures |

## Batas implementasi yang disengaja

Deal auction kini diaktifkan sebagai gameplay inferred yang diaudit: listing snapshot, countdown, `/versus-bid`, bid reservation, outbid release, expiry, settlement, roster transfer, dan ledger idempotent. Normal Scout offer generation, Sponsor payout/cooldown, diamond shop spending, player-status improvement, exact matchmaking queue/MMR, opponent selection, Saves/Tackles telemetry, background notifications, dan literal mobile bottom navigation belum diaktifkan sebagai gameplay penuh. Versus assignment occurs automatically from the ordinary Versus entry point through a transparent `RECOVERY_INFERRED` system-managed abstraction; it does not claim the original queue, MMR, or server-global matching algorithm. Footage membuktikan keberadaan surface tersebut, tetapi tidak memberikan seluruh cost, cooldown, server mutation, persistence, dan formula. Fitur yang belum memiliki ruleset authoritative tetap read-only agar tidak merusak correctness dan auditability.

Semua formula strength, reward, ranking tie-breaker, auction timing, scout effect, sponsor payout, season cadence, dan network semantics yang tidak dikonfirmasi tetap diberi status `RECOVERY_INFERRED`. Implementasi ini adalah high-fidelity UX reconstruction berbasis footage terverifikasi, bukan klaim pixel-perfect atau protocol parity 1:1.

## Referensi

[1]: https://www.youtube.com/watch?v=V8MsDUXNl8A — *Footy Star Versus Mode | No Commentary | Day1*, dedicated Versus walkthrough.

[2]: https://www.youtube.com/watch?v=KQiUcv9d25c — *Football Rising Star review (Android game, 2021)*, review containing a verified Versus segment.

[3]: https://apps.apple.com/us/app/football-rising-star/id1585604439 — Official App Store listing and public battle-mode changelog references.

[4]: https://www.taptap.cn/app/220982/topic?type=video — Football Rising Star community video tab; visible posts were checked and non-Versus videos excluded.


## Follow-up implementation: Player calibration and Versus economy

The latest follow-up adds a versioned Player formula module at `src/domain/player-formulas.ts`. Player match records now carry `formulaVersion`, training EXP and match reward calculations use centralized pure functions, and `tools/calibrate-player-formulas.ts` produces deterministic DISCORDFC probes. These probes are explicitly `PROBE_ONLY`; they are not observations of the original client and do not justify an official parity claim.

Versus now has a functional inferred Deal surface. New season state generates system roster snapshot listings with countdowns; `/versus-bid listing_id:<id> amount:<coin>` validates minimum bid, prevents use of reserved coin, records reservation, releases an outbid reservation, and settles atomically at expiry. Settlement debits the winner, moves the player snapshot to the assigned team, updates roster version, and writes an idempotent Versus ledger event. Scout and Sponsor remain non-mutating because their official cost/effect/cooldown rules are not recovered.

PostgreSQL schema now includes queryable projections for `versus_queue_tickets`, `versus_matches`, `versus_market_listings`, and `versus_wallet_reservations`, while the profile JSONB remains migration-compatible. The adapter mirrors Versus ledger entries and projections in the same CAS transaction as profile persistence. The pure queue matcher carries rating and roster snapshots, TTL, widening rating window, deterministic assignment, and expiry; the current public entry remains `/versus-profile`/Versus Home.

Latest local verification after these changes: 55 tests passing, build PASS. Final production audit and push are required before delivery.
