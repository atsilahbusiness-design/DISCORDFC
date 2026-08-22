# Laporan Audit Mendalam DISCORDFC

**Tanggal audit:** 22 Agustus 2026
**Repository:** `atsilahbusiness-design/DISCORDFC`
**Baseline commit terakhir yang sudah dipush:** `30c10bd`
**Status perubahan audit:** terdapat perubahan lokal setelah commit tersebut; perubahan lokal belum dipush.
**Ruang lingkup:** Player Mode, Coach Mode, Versus Mode, Discord adapter, persistence, concurrency, security, balance, dan kesesuaian dengan bukti recovery.

## Ringkasan eksekutif

Audit mendalam menemukan beberapa masalah correctness yang tidak terlihat hanya dari test suite awal. Masalah tersebut sudah diperbaiki dan diuji ulang: sinkronisasi level Player dari reward EXP, kebocoran honor Coach ke Player Hall of Honor, fractional Coach EXP, mutasi event setelah retirement, sinkronisasi reward Versus yang dapat menghilang ketika membaca season fresh, race pada `/versus-join`, deadline round Versus, coupling initial Versus roster terhadap Player progression, fixture non-1011, label season Coach pada `/season-end`, submission lineup Versus, full-league projection Coach, Coach Champions League isolation, atomic batch profile persistence, store-backed group locking, dan Versus reward ledger.

Setelah perbaikan, `pnpm build`, `pnpm test`, targeted audit, dan stress simulation terbaru berhasil. Stress simulation menjalankan **300 trial untuk setiap mode**, dengan **115.770 domain actions**, **1.200 Versus submissions legal**, **1.200 ledger checks**, **0 trial gagal**, **0 invariant failure**, dan **0 determinism failure**.[1] [3] [12] Hasil tersebut membuktikan kestabilan ruleset hasil rekonstruksi saat ini; hasil itu **tidak membuktikan parity 1:1** dengan server Football Rising Star karena formula authoritative, backend settlement, dan protokol live tidak tersedia.

> **Kesimpulan audit:** codebase cukup stabil untuk closed beta internal berbasis satu proses, dan backend PostgreSQL kini memiliki batch transaction plus advisory group lock untuk menghindari partial Versus projection writes pada jalur Discord. Namun, implementasi belum setara dengan canonical shared Versus repository production-grade atau parity penuh. Risiko tersisa terbesar adalah season/battle masih diproyeksikan ke profile JSONB, formula dan settlement masih inferred, serta komponen UI lama belum seluruhnya expected-version-bound.

## Metode audit

Audit dilakukan melalui pembacaan statis domain engine dan adapter Discord, pencocokan command registry dengan handler, pemeriksaan storage JSON/PostgreSQL, dependency audit, secret scan, targeted regression harness, property checks, dan stress simulation. Test suite repository dijalankan dengan Node test runner dan TypeScript build. Stress harness berada di `tools/stress-simulation.ts`, sedangkan targeted checks berada di `tools/targeted-audit.ts`.

| Dimensi | Pemeriksaan | Hasil |
|---|---|---|
| Build dan unit/regression | `pnpm build` dan `pnpm test` | **44 passing, 0 failing** |
| Stress Player | 300 trial × 60 week | 300/300 sukses; 0 invariant/determinism failure |
| Stress Coach | 300 trial × 2 season | 300/300 sukses; 0 invariant/determinism failure |
| Stress Versus | 300 trial × capacity 8 | 300/300 sukses; 0 invariant/determinism failure |
| Targeted audit | EXP, honor, retirement, reward sync, non-1011 league | Semua check **PASS** |
| Dependency security | `pnpm audit --prod --audit-level=high` | Tidak ada known vulnerability |
| Secret/format | secret pattern scan dan `git diff --check` | Tidak ada credential aktual; whitespace bersih |
| Deployment runtime | Docker/Compose lokal | Belum dijalankan karena Docker CLI tidak tersedia di sandbox |

## Temuan yang ditemukan dan sudah diperbaiki

| ID | Severity awal | Temuan | Perbaikan |
|---|---|---|---|
| FIX-01 | Medium | Daily reward dan event menambah `totalExp` tetapi level Player dapat tertinggal. | Level kini disinkronkan dari total EXP pada daily reward, event, dan achievement claim. |
| FIX-02 | Medium | Coach career menyalin Player honors dan settlement Coach dapat menulis ke `profile.honors`. | Coach memakai `coach.honors` sendiri; Player Hall of Honor tidak dimutasi oleh Coach. |
| FIX-03 | Medium | `assignCoachExp` menerima fractional EXP melalui domain API. | Domain menolak nilai non-integer, negatif, dan Coach retired. |
| FIX-04 | Medium | Pending Coach event masih dapat diselesaikan setelah retirement. | `resolveCoachEvent` hanya menerima Coach berstatus `EMPLOYED`; job dan EXP juga memiliki retirement guard. |
| FIX-05 | High | `syncVersusProfileWithSeason` memodifikasi object season dan reward dapat hilang saat sync ulang dari season fresh. | Season input tidak dimutasi; reward history direkonstruksi secara idempotent saat sync ulang. |
| FIX-06 | High | `/versus-join` melakukan read/save/persist group di luar group lock. | Seluruh operasi join group sekarang berada di bawah lock per group dalam satu process. |
| FIX-07 | High | `/versus-round` dapat dipanggil sebelum `roundDeadline`, sehingga round dapat dilompati secara instan. | Settlement round menolak timestamp sebelum deadline. |
| FIX-08 | Medium | Versus Club pertama kali dibuat dengan base power yang bergantung pada level dan technique Player. | Initial Versus roster memakai base independen agar progression Player tidak menaikkan power Versus secara tersembunyi. |
| FIX-09 | Medium | Club non-1011 dapat dipilih tetapi fixtures/standings sebelumnya selalu memakai daftar primary league. | Fixture dan standings dibangun dari seluruh recovered club pada league club yang dipilih. |
| FIX-10 | Medium | Roster contract timestamps memakai wall clock `Date.now()` walaupun simulasi menerima `now`. | Helper roster memakai timestamp simulasi sehingga replay tanggal lama tetap deterministik. |
| FIX-11 | Medium | Reward match Player tidak masuk ledger, sedangkan daily/event/transfer sudah memakai ledger. | Match reward kini mencatat `MATCH_REWARD` ke ledger. |
| FIX-12 | Medium | Champions League yang sudah selesai pada season yang sama dapat dimulai ulang. | Start Champions League menolak state non-active pada season yang sama. |
| FIX-13 | Medium | Capacity Versus ganjil menghasilkan schedule pasangan yang tidak lengkap. | Domain menolak capacity ganjil dan mewajibkan kapasitas genap. |
| FIX-14 | Low | `/season-end` menampilkan Player season ketika memproses Coach season. | Label completed/active season kini memakai counter Coach untuk Coach Mode. |
| FIX-15 | High | Versus belum memiliki jalur gameplay untuk submission XI, substitutes, captain, formation, dan tactic. | Domain validator dan command `/versus-lineup` kini menyimpan submission owner-bound sebelum deadline, dengan battle ID dan roster version. |
| FIX-16 | High | Coach board rank dihitung dari row opponent yang masih zero dan Champions command selalu memakai Player aggregate. | Klasemen Coach melengkapi row non-user secara deterministik `RECOVERY_INFERRED`; Champions engine menerima mode dan menyimpan state/season/reward Coach terpisah. |
| FIX-17 | High | Versus group disimpan melalui save per profile dan hanya memiliki lock in-memory. | `saveBatch` menyimpan projection seluruh member dalam satu transaction; PostgreSQL memakai advisory lock per group, JSON fallback memakai queue lokal. |
| FIX-18 | Medium | Versus money/coin reward sulit direkonsiliasi karena tidak memiliki event ledger. | Sync profile membuat ledger entry idempotent berbasis season/battle/club/currency dengan balance-after dan settlement timestamp. |

Perbaikan tersebut telah diverifikasi oleh test suite permanen dan targeted audit. Artefak targeted audit menguji ulang hasil yang sebelumnya gagal, sehingga status PASS berarti invariant pasca-perbaikan benar-benar tercapai, bukan sekadar exception tidak muncul.

## Temuan tersisa dengan prioritas risiko

### P0 — Persistence Versus: mitigated pada projection path, canonical repository masih tersisa

`persistVersusSeason` kini membentuk seluruh profile projection terlebih dahulu lalu memakai `saveBatch`. `PostgresPlayerStore.saveBatch` menulis semua profile dan ledger dalam satu transaction dengan optimistic CAS; `withVersusGroupLock` memakai PostgreSQL advisory lock sehingga dua bot replica tidak menjalankan settlement group yang sama secara bersamaan. JSON fallback memiliki atomic temp-file write dan group queue untuk satu process.

Risiko canonical masih ada: season, battle, standings, dan submissions belum menjadi row shared tersendiri, melainkan embedded projection pada profile JSONB. Karena itu, jalur Discord sudah terlindungi dari partial multi-profile commit pada backend yang tersedia, tetapi audit tidak mengklaim dedicated Versus repository, cross-service repair workflow, atau canonical source of truth. Dedicated tables tetap diperlukan sebelum skala tinggi, admin settlement, atau migrasi lintas service.

### P1 — Versus UX and submission gameplay: interactive flow implemented from expanded public evidence

Recovery menunjukkan submission untuk XI, substitutes, captain, formation, tactic, dan roster version.[3] Video Versus-only `V8MsDUXNl8A` juga memperlihatkan pre-dashboard country/logo/name setup yang ownership semantics-nya belum terbukti, cash/coin/energy header, Sign-up/Registered state, auction Deal listings, normal Scout, pitch lineup, formation choices, tactical Instructions, sponsor tiers, rewards, dan multi-category rankings. Review `KQiUcv9d25c` mengonfirmasi dashboard next match/latest result, lineup, match preview, Deal/Scout, sponsor, rewards, club detail, My Schedule, dan Global Ranking. Community evidence memperlihatkan system-managed market dan timed competition state. Versus Home kini menjadi hub owner-bound dengan tombol Home, Next Battle, Lineup, Results, Standings, Registration, Market, Rewards, Schedule, Rankings, Global Ranking, dan Sponsor. Entry utama memakai `/versus-profile` atau tombol Versus Home; assignment berjalan otomatis saat entry pertama. `/versus-join` dipertahankan sebagai private-group fallback. Pre-match flow memakai select menu formation/tactic, selector XI per posisi, captain, substitutes, review, rating/attack/defence preview, dan confirm. `/versus-roster` tetap menjadi fallback diagnostik dan discovery surface. Domain memvalidasi owner/battle/formation/eligibility/roster version/deadline, dan `processVersusRound` mempertahankan submission sampai snapshot settlement.

Regression test membuktikan component custom IDs owner-bound serta submission legal/stale/owner mismatch/deadline rejection dan seluruh navigation surface tetap owner-bound. Batasan UX Discord yang tersisa adalah tidak adanya drag-and-drop pitch, persistent mobile bottom navigation literal, serta background reminder otomatis. Exact matchmaking queue/MMR/opponent selection, auction bid settlement, Scout offer generation, sponsor claim, diamond shop spending, dan player-status boost masih read-only atau inferred karena cost, cooldown, payout, persistence, and effect rules belum terverifikasi. Public Chinese App Store changelogs mention advanced scout, player-status improvement, dan group code; fitur tersebut tidak boleh difabrikasi hanya demi tampilan. Command registration tetap perlu dijalankan setelah deployment.

### P1 — Coach standings: projection implemented, authoritative opponent simulation belum tersedia

Coach season settlement kini mengisi row non-user yang belum dimainkan dengan projection deterministik berdasarkan recovered grade/prestige dan stable club hash. Semua angka projection secara eksplisit bersifat `RECOVERY_INFERRED`, dan board rank dihitung setelah projection sehingga tidak lagi menganggap opponent sebagai zero-point clubs.

Projection ini memperbaiki correctness struktur klasemen, tetapi bukan pengganti server result atau full opponent match simulation. Ruleset version/seed untuk projection dan authoritative golden outputs masih diperlukan jika perusahaan ingin kalibrasi numeric terhadap game asli.

### P1 — Coach Champions League: mode-specific flow implemented

Competition engine kini menerima mode Player/Coach, mengambil club state dan season counter yang sesuai, menghitung rating Coach dari managed roster/Coach ability, dan menaruh state pada `coach.championsLeague`. Command `/champions` menyediakan `mode:PLAYER|COACH`, sementara Player state tetap berada pada `profile.championsLeague`. Reward aset/prestige tidak menyeberang aggregate.

Batasan yang masih terbuka adalah opponent bracket yang masih fixed dan formula yang inferred. Recovery/config authoritative diperlukan untuk mengganti array opponent dan koefisien tanpa mengubah separation contract.

### P1 — Player season cadence masih berbeda dari Club/Coach cadence

`engine.ts` mereset Player `league` setelah `matchday > 10`, sedangkan Club/Coach menggunakan home-away fixture sekitar 38 matchday. Perbedaan ini mungkin merupakan desain Player Mode yang berbeda, tetapi bukti recovery yang tersedia belum cukup untuk menyatakan bahwa angka 10 adalah cadence asli. Ini perlu dikonfirmasi melalui config server/client atau golden output sebelum dianggap parity.

### P1 — Component action belum version-bound

Custom ID dashboard sudah owner-bound, tetapi tidak membawa profile version, battle ID, atau roster version. Button lama setelah state berubah tetap mengambil profile terbaru lalu menjalankan action yang sama. Per-user queue mencegah dua mutation simultan pada satu process, tetapi tidak mencegah stale UI intent. Untuk Versus, submission harus memasukkan `battleId`, `rosterVersion`, dan deadline; untuk Player/Coach, action yang sensitif sebaiknya membawa expected profile version.

### P2 — JSON fallback dan queue belum multi-instance safe

`JsonPlayerStore` aman untuk satu process karena memiliki serialized write queue dan atomic temp-file rename, tetapi tidak memiliki compare-and-swap terhadap penulis eksternal.[7] User rate limiter dan user command queue juga hanya hidup di memory process.[1] README telah menyatakan keterbatasan ini; deployment multi-instance tetap membutuhkan Redis/database-backed lock, rate limiter, dan repository concurrency.

### P2 — Audit ledger: Versus reward entries implemented; broader asset audit remains

Player match dan achievement memiliki ledger, dan Versus sync kini menambah event money/coin berbasis battle ID serta season ID dengan idempotency key. Club assets, Coach board rewards, dan beberapa non-wallet mutations masih belum memiliki event ledger seragam yang dapat direkonsiliasi lintas mode. Dedicated immutable event tables tetap direkomendasikan untuk refund, fraud investigation, dan admin settlement.

### P2 — Maintenance dapat berkonflik dengan command aktif

Maintenance membaca seluruh profile lalu menyimpan hasil satu per satu. Pada PostgreSQL, command aktif dapat membuat salah satu save maintenance gagal karena version berubah; seluruh maintenance loop kemudian berhenti pada profile tersebut. Ini aman dari silent overwrite, tetapi menghasilkan partial maintenance run tanpa retry/backoff/report per profile. Implementasi production sebaiknya memakai retry terbatas dan observability per user.

### P2 — Formula numeric dan network semantics belum authoritative

Overall, goal chance, injury chance, reward, promotion/relegation, Coach event chance, Versus capacity, dan settlement coefficients masih `RECOVERY_INFERRED`. Recovery schema membuktikan field/class/method shape, tetapi tidak membuktikan body method atau server-side rules. Tidak ada dasar yang cukup untuk mengklaim numeric parity 1:1, live matchmaking resmi, anti-cheat, atau real-time synchronization dengan server game asli.

## Balance dan parity assessment

Stress result terbaru menunjukkan distribusi berikut pada ruleset saat ini. Angka ini adalah observasi implementasi, bukan data game asli.

| Mode | Aktivitas utama | Hasil audit |
|---|---|---|
| Player | 18.000 week, 17.358 match, 1.373 injury | Tidak ada invariant failure; reward/EXP/HP/energy tetap berada pada domain valid. |
| Coach | 22.800 round, 600 season, 22.800 halftime checks | Tidak ada deadlock roster; non-user standings kini diproyeksikan deterministically sebagai `RECOVERY_INFERRED`. |
| Versus | 4.200 round, 16.800 battle, 2.400 season rewards, 1.200 submissions | Semua battle published dan memiliki halftime; stress memakai submission legal pada round pertama dan memverifikasi ledger idempotency. Production path batch-save/advisory-lock capable. |

Balance saat ini cukup untuk internal deterministic testing, bukan untuk live economy. Sebelum beta publik, perlu golden tests berbasis output resmi, telemetry match outcome, reward sink, injury frequency, rank distribution, dan reconciliation report. Perubahan balance sebaiknya menaikkan `GAME_BALANCE.version` dan menyimpan ruleset version pada historical settlement.

## Security dan operational status

Tidak ditemukan token Discord, credential database aktual, private key, atau binary game pada source yang diaudit. `.env.example` hanya berisi placeholder. `pnpm audit --prod --audit-level=high` tidak menemukan known vulnerability pada dependency production. Prinsip hardening yang dipakai konsisten dengan panduan keamanan Node.js.[13] Secret scan CI tetap perlu dipertahankan dan harus mengecualikan placeholder secara eksplisit tanpa melemahkan pola credential aktual.

Risk terbesar bukan secret leakage, melainkan trust boundary multiplayer: settlement yang dijalankan oleh handler bot, persistence group yang tidak atomic lintas user, dan belum adanya distributed lock. Karena Versus dirancang sebagai mode online, tiga hal tersebut perlu dianggap blocker sebelum deployment multi-instance atau kompetisi dengan reward bernilai tinggi.

## Acceptance gate yang disarankan

| Gate | Syarat lulus |
|---|---|
| Internal domain beta | 42 tests passing, targeted audit PASS, 300 trial per mode tanpa invariant/determinism failure. |
| Single-process guild beta | Submission Versus, legal/stale/deadline tests, Coach full standings, mode-specific Champions, dan reward ledger sudah tersedia; discovery UX dan broader reconciliation masih direkomendasikan. |
| Multi-instance beta | PostgreSQL projection path memiliki batch transaction dan advisory lock; dedicated Versus repository, cross-service repair, retry policy, serta fault-injection test masih diperlukan. |
| Public economy | Golden outputs resmi, reward/injury/standings calibration, immutable ledger, rollback/backup drill, monitoring alert. |
| Parity claim | Hanya klaim high-fidelity reconstruction sampai source/config/backend authoritative tersedia. |

## Status delivery

Perubahan audit lokal saat laporan ini dibuat belum dibuat commit atau dipush. Working tree berisi source fixes, test tambahan, targeted audit harness, stress evidence, dan dokumentasi yang diperbarui. Setelah verification final, perubahan perlu dibundel dalam commit terpisah dari baseline `30c10bd`. Sebelum delivery berikutnya, jalankan kembali:

```bash
pnpm build
pnpm test
pnpm exec tsx tools/targeted-audit.ts
SIM_TRIALS=300 SIM_JSON=docs/STRESS_SIMULATION_RESULTS_REMEDIATION_2026-08-22.json SIM_MD=docs/STRESS_SIMULATION_REPORT_REMEDIATION_2026-08-22.md pnpm exec tsx tools/stress-simulation.ts
git diff --check
pnpm audit --prod --audit-level=high
```

## References

[1]: ../README.md "DISCORDFC README and current runtime contract"
[2]: ./THREE_MODE_PARITY_AUDIT.md "Three-mode parity audit"
[3]: ./VERSUS_TRUTH_MATRIX.md "Versus truth matrix and recovery evidence"
[4]: ./GAMEPLAY_TRUTH_MATRIX.md "Cross-mode gameplay truth matrix"
[5]: ../src/discord/handlers.ts "Discord command and persistence adapter"
[6]: ../src/storage/postgres-store.ts "PostgreSQL profile persistence"
[7]: ../src/storage/json-store.ts "JSON fallback persistence"
[8]: ../src/domain/versus-engine.ts "Versus domain engine"
[9]: ../src/domain/coach-career-engine.ts "Coach career domain engine"
[10]: ../src/domain/club-engine.ts "Club and fixture domain engine"
[11]: ../tools/stress-simulation.ts "Reproducible stress simulation harness"
[12]: https://docs.discord.com/developers/interactions/receiving-and-responding "Discord interaction response guidance"
[13]: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html "OWASP Node.js Security Cheat Sheet"
