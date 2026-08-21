# Handoff Prompt — Football Rising Star Discord Bot Professional Hardening

## Context

Repository target: `https://github.com/atsilahbusiness-design/DISCORDFC`. Commit release engineering terbaru: `a343e86`. Branch `main` sudah dipush.

Tujuan proyek adalah membangun ulang loop Football Rising Star di Discord tanpa mengklaim formula 1:1 ketika source C# dan backend asli tidak tersedia.

## Data client yang telah diparse

`FootballRisingStar_2.8.0_Client_Data_Audit.zip` berisi payload client yang dianalisis secara pasif. Parser berbasis schema binary berhasil membaca **332/332 record** `cfg_club_202603` dan **5.133 fixed-field player record valid** dari header 9.395 pada `cfg_player_202603`. Data player mencakup name CN/EN, Num, club, position, price, init age, normal value, auction value, dan grow type. Position mapping mengikuti `PositionId`: FW 1–5, MF 6–9, DF 10–12, GK 13.

Derived data yang masuk repository adalah `data/recovery/club_202603.json` dan `data/recovery/player_202603_fixed_fields.json`. Jangan menyalin binary client mentah, token, credential database, atau backend endpoint tebakan ke repository.

## Runtime feature set

Career, club, fixture, standings, promotion/degradation, Champions League, contract, daily reward, event, achievement, market, buy/sell transfer, official club listing/join, maintenance scheduler, admin stats/market refresh, PostgreSQL persistence, JSON fallback, Docker Compose, structured logging, CI, and balance harness sudah tersedia.

Profile baru memilih Arsenal dari league 1011 jika recovery data tersedia. Roster memakai nama player client berdasarkan official club ID. Overall/stat runtime tetap `RECOVERY_INFERRED` karena ability dictionary variable-length dan body `GetAbilityScoreByPosition` belum diparse penuh.

Dashboard Discord tersedia setelah `/start` atau `/profile`: button `Profile`, `Train`, `Play match`, `Club office`, serta training select. Custom ID terikat ke owner Discord profile. Slash commands lama tetap compatibility layer.

## Professional hardening yang sudah diimplementasikan

1. Slash commands melakukan `deferReply` lalu `editReply` sehingga operasi DB/simulasi tidak melewati acknowledgement window.
2. Button/select interactions memiliki owner validation, rate limit, logging, dan per-user command queue.
3. JSON store memiliki serialized write queue dan profile version.
4. PostgreSQL memiliki optimistic concurrency melalui `version`, transaction untuk profile/ledger, dan conflict error yang user-safe.
5. Home advantage tidak lagi selalu bernilai satu; event `moraleDelta` diterapkan ke user player.
6. Transfer fee official club masuk economy ledger. Market memiliki cooldown enam jam, duplicate-player guard, dan roster cap 32.
7. Admin command memiliki default member permission `Manage Guild` dan tetap memakai `ADMIN_USER_IDS` allowlist.
8. Maintenance memiliki overlap guard; structured logger menangani startup, shutdown, client error, unhandled rejection, uncaught exception, command failure, dan component failure.
9. CI mencakup dependency audit, secret pattern scan, build, 22 test, PostgreSQL migration smoke test, dan Docker build.
10. Compose menggunakan PostgreSQL healthcheck, environment password, auto-migration, `init`, dan graceful stop.

## Verification

`pnpm build` lulus. `pnpm test` lulus dengan **22 test, 0 gagal**. `pnpm audit --prod --audit-level high` tidak menemukan known vulnerability pada dependency production saat audit. `git diff --check` bersih. Docker runtime belum dapat dieksekusi di sandbox karena Docker CLI tidak terpasang, tetapi sudah menjadi required CI step.

Balance harness: `scripts/balance-snapshot.ts`, baseline 1.000 seeded match per posisi, output disimpan pada `docs/BALANCE_SNAPSHOT.md`. Hasil menunjukkan FW lebih kuat daripada GK/DF; jangan mengubah angka secara manual tanpa golden tests dan target telemetry.

## Research and architecture documents

Baca `docs/RESEARCH_NOTES.md` untuk sumber Discord, Unity/GDC economy, ACM engagement rewards, OWASP, dan USENIX privacy. Baca `docs/PROFESSIONAL_ROADMAP.md` untuk definition of done, KPI, priority P0/P1/P2, deployment options, dan product guardrails. Baca `docs/OPERATIONS.md` untuk backup, restore drill, rollback, monitoring, migration, secrets, dan multi-instance caveat.

## Remaining parity work

1. Parse `cfg_ability`, `cfg_abilityLevel`, variable-length `_abilityDic/_allAbilitydic`, dan `PositionConfig` untuk mengubah stat inferred menjadi verified/calibrated.
2. Parse `cfg_league`, `cfg_round`, `cfg_roundBattleRule`, `cfg_coachFormation`, dan `cfg_coachTactics` agar fixture/formula lebih dekat ke client.
3. Parse `cfg_coachGameEventUserChoose` cost/reward/localization untuk event parity.
4. Implement shared market/economy service dan global ledger reconciliation, bukan market per profile.
5. Pindahkan rate limiter/queue ke Redis atau database sebelum multi-instance deployment.
6. Buat golden tests dari output game resmi untuk overall, growth, goal, reward, standings, contract, event, dan market.
7. Jalankan restore drill, staged guild test, canary rollout, dan observability review.
8. Jalankan live guild test hanya setelah credential Discord diberikan melalui environment aman.
9. Jangan menghubungkan Firebase/backend endpoint berdasarkan tebakan; audit hanya mengonfirmasi dependency Firebase App/Analytics, bukan Remote Config atau endpoint produksi.

## Security and licensing

Jangan memasukkan token Discord, credential database, binary game, atau asset berlisensi ke commit tanpa otorisasi. Gunakan source/config internal yang berwenang untuk parity final. Jangan menambahkan privileged Discord intents tanpa privacy/product review. Hindari loot box berbayar, pay-to-win, dan daily FOMO sebelum balance, fairness, dan compliance review.
