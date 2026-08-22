# Trae AI Handoff Prompt — DISCORDFC Remediation

## Tujuan

Lanjutkan pengembangan `https://github.com/atsilahbusiness-design/DISCORDFC` sebagai rekonstruksi high-fidelity Football Rising Star berbasis Discord. Pertahankan tiga aggregate terpisah: Player Mode solo career, Coach Mode solo club management, dan Versus Mode asynchronous online/group league. Jangan menyatakan parity 1:1 dengan game asli karena body method, server settlement, konfigurasi live, dan protokol network authoritative belum tersedia. Setiap angka atau formula yang belum diverifikasi harus tetap diberi provenance `RECOVERY_INFERRED`.

Baseline yang sudah ada di remote adalah commit `30c10bd`. Perubahan pada handoff ini masih berada di working tree lokal dan belum di-commit atau dipush. Jangan membuang perubahan lokal yang sudah ada.

## Perubahan remediation yang sudah dilakukan

| Area | Implementasi | Status |
|---|---|---|
| Versus gameplay | Domain `submitVersusLineup` dan command `/versus-lineup` menerima battle ID, XI, substitutes, captain, formation, tactic, serta roster version. Owner, battle, formation, eligibility, roster version, active round, dan deadline divalidasi. | Selesai dan diuji |
| Versus discovery | Command `/versus-roster` menampilkan player ID, posisi, HP/status, eligibility, roster version, battle ID, opponent, dan deadline. Versus Home menjadi hub dengan Home, Next Battle, Lineup, Results, dan Standings. | Selesai dan build-tested |
| Versus pre-match UX | Next Battle/Lineup membuka setup interaktif formation/tactic, selector XI per posisi, captain, substitutes, review, dan confirm. Next Battle menampilkan waiting state jika submission sudah locked dan membuka result flow setelah deadline. Registration menampilkan group code, competition, capacity, dan season state. | Selesai dan build-tested |
| Versus settlement | Submitted lineup dipertahankan sampai snapshot settlement; default lineup tetap digunakan hanya jika user tidak submit. | Selesai dan stress-tested |
| Versus persistence | `BatchPlayerStore.saveBatch` menulis semua profile projection dalam satu operasi. JSON memakai serialized write queue dan atomic temp-file rename. PostgreSQL menjalankan semua profile/ledger write dalam satu transaction. | Selesai untuk projection path |
| Versus distributed lock | `PostgresPlayerStore.withVersusGroupLock` memakai advisory lock berbasis group code. JSON fallback memakai group queue satu process. Handler Versus memakai store-aware lock. | Selesai untuk jalur Discord |
| Versus auditability | `VersusLedgerEntry` mencatat money/coin battle reward dan season reward menggunakan key idempotent berbasis season/battle/club/currency, dengan settlement timestamp dan balance-after. | Selesai untuk reward Versus |
| Coach standings | `projectCoachLeagueStandings` mengisi performa non-user clubs secara deterministic berdasarkan recovered grade/prestige dan stable club hash. Projection diberi komentar dan status `RECOVERY_INFERRED`. Board rank dihitung setelah projection. | Selesai sebagai projection, bukan server simulation |
| Coach Champions League | `CoachCareerState.championsLeague` ditambahkan. Competition engine menerima mode Player/Coach, memakai season dan club aggregate yang sesuai, serta reward tidak menyeberang ke Player. `/champions` memiliki option `mode:PLAYER|COACH`. | Selesai sebagai isolated flow |
| Regression coverage | Test batch persistence, group lock, legal/stale/deadline Versus submission, ledger idempotency, Coach full standings, Player/Coach Champions isolation, dan owner-bound Versus Home/custom IDs ditambahkan. | Selesai |
| UX evidence | Expanded research in `docs/VERSUS_UX_RESEARCH_2026-08-22.md`, Versus-only video research, and `docs/VERSUS_UX_EVIDENCE_MAP_2026-08-22.md` now include an explicit Versus walkthrough (`V8MsDUXNl8A`) plus review timestamps (`KQiUcv9d25c`), App Store changelogs, MWM screenshot annotations, Facebook friend-battle promotion, TapTap, Douyin, and community search results. | Selesai dengan evidence boundary |
| Versus UX surfaces | Based on the verified Versus walkthrough, Home now exposes Market, Deal/Scout tabs, Sponsor, Rewards, Schedule, Rankings, category tabs, Global Ranking, and pre-match rating/attack/defence preview. Sponsor purchase, diamond spending, auction mechanics, and unrecovered GK telemetry remain read-only. | Selesai dengan evidence boundary |
| Stress coverage | Harness 300 trial per mode diperluas agar round pertama Versus memakai legal submissions, Coach memeriksa full standings, dan profile sync memeriksa ledger. | Selesai |

## File penting

Source utama yang berubah adalah `src/domain/versus-engine.ts`, `src/domain/club-engine.ts`, `src/domain/coach-career-engine.ts`, `src/domain/competition-engine.ts`, `src/domain/types.ts`, `src/discord/commands.ts`, `src/discord/handlers.ts`, `src/storage/json-store.ts`, dan `src/storage/postgres-store.ts`. Regression tests berada pada `test/versus-mode.test.ts`, `test/coach-career.test.ts`, dan `test/storage-concurrency.test.ts`. Harness verifikasi berada pada `tools/targeted-audit.ts` dan `tools/stress-simulation.ts`.

Dokumentasi aktif berada pada `docs/DEEP_AUDIT_REPORT_2026-08-22.md`, `docs/THREE_MODE_PARITY_AUDIT.md`, `docs/STRESS_SIMULATION_REPORT_REMEDIATION_2026-08-22.md`, dan `docs/STRESS_SIMULATION_RESULTS_REMEDIATION_2026-08-22.json`. `README.md` dan `docs/TRAe_AI_PROMPT.md` sudah diperbarui.

## Verification evidence

Verification terakhir sebelum delivery menghasilkan status berikut.

| Check | Hasil |
|---|---|
| `pnpm build` | PASS |
| `pnpm test` | PASS — 43 tests, 0 failing |
| `pnpm exec tsx tools/targeted-audit.ts` | PASS — Coach standings, Coach Champions isolation, Versus ledger, Player sync, retired guards, dan non-1011 league |
| Stress | PASS — 300 trial per mode, 115.770 domain actions, 1.200 legal Versus submissions, 1.200 ledger checks, 0 trial failure, 0 invariant failure, 0 determinism failure. UX component tests also pass. |
| `git diff --check` | PASS pada pemeriksaan sebelum dokumentasi final |
| `pnpm audit --prod --audit-level=high` | Wajib dijalankan ulang pada final CI/local verification |
| Docker runtime | Belum dijalankan di sandbox karena Docker CLI tidak tersedia; CI tetap menjadi gate |

Stress evidence bukan bukti parity game asli. Ia hanya membuktikan determinism dan invariant pada ruleset rekonstruksi saat ini.

## UX parity boundary

The expanded public evidence supports a management-first rhythm: persistent navigation/home, a pre-dashboard country/logo/name setup sequence with unresolved ownership semantics, cash/coin/energy status, group-code entry and friend-battle promise, competition registration, next match/result, auction Deal listings with countdown, normal Scout, pitch lineup, formation, tactical instructions, sponsor tiers, rewards, fast off-screen simulation, result summary, multiple ranking categories, schedule, and global ranking. The explicit Versus-only walkthrough `V8MsDUXNl8A` is the primary visual source for these surfaces; `KQiUcv9d25c` independently confirms the Versus dashboard, lineup, preview, Deal/Scout, sponsor, rewards, ranking, club detail, schedule, and global ranking sequence. TapTap community evidence confirms a system-managed Versus market and timed competition state. DISCORDFC now performs system-managed assignment automatically when `/versus-profile` or the Versus Home button is opened, while retaining `/versus-join` as a private-group fallback and internal `VersusClub` only as a recovery/battle aggregate. Exact original copy, graphics, matchmaking queue/MMR, opponent selection, backend notifications, identity persistence, auction countdown semantics, Scout offers, sponsor/diamond costs, status-boost effects, and mobile gestures require further official evidence and must not be represented as verified parity.

## Risiko yang masih terbuka

Pertama, Versus masih memakai profile JSONB sebagai projection. Batch transaction dan advisory lock melindungi jalur Discord PostgreSQL dari partial multi-profile commit dan concurrent group settlement, tetapi belum ada canonical tables untuk `versus_groups`, `seasons`, `clubs`, `battles`, `submissions`, `settlements`, dan immutable settlement events. Dedicated repository/table layer tetap dibutuhkan sebelum skala tinggi atau admin settlement lintas service.

Kedua, Coach non-user standings memakai deterministic projection, bukan pertandingan lawan yang benar-benar disimulasikan dari authoritative server result. Bracket Champions League masih fixed opponent array. Semua coefficient, cadence, reward, promotion/relegation, injury, dan rating formula yang belum dikonfirmasi tetap `RECOVERY_INFERRED`.

Ketiga, `/versus-roster` memperbaiki discovery untuk command submission, tetapi dashboard component lama belum seluruhnya membawa expected profile version atau battle version. Versus submission sendiri sudah membawa battle ID, roster version, dan deadline. Langkah berikutnya dapat menambahkan version-bound component IDs serta retry/backoff dan per-profile observability untuk maintenance.

Keempat, ledger Player dan Versus sudah ada pada area yang diuji, tetapi Coach board rewards, Club assets, serta seluruh settlement mutation belum mempunyai immutable event store lintas mode. Jangan menganggap JSONB ledger projection sebagai audit log global.

## Instruksi aman untuk pekerjaan berikutnya

Jangan menghapus atau mereset working tree. Jalankan `pnpm build`, `pnpm test`, targeted audit, dan dependency audit sebelum membuat perubahan lanjutan. Bila mengubah ruleset, naikkan ruleset/balance version dan tambahkan regression test deterministic. Bila menambah persistence, pertahankan optimistic CAS dan all-or-nothing semantics. Bila mengubah Discord command, perbarui registry dan handler bersama-sama, lalu ingat bahwa command registration Discord harus dijalankan dengan `pnpm commands:register` setelah deployment.

Sebelum commit/push, review `git diff --check`, cek secret scan, dan pastikan tidak ada Discord token, database credential, binary game, atau proprietary archive yang masuk repository. Delivery berikutnya boleh membuat commit terpisah dari `30c10bd`, tetapi push hanya setelah pemilik repository menyetujui isi diff.
