# Handoff Prompt — Football Rising Star Discord Bot Expanded

## Tujuan

Lanjutkan repository `https://github.com/atsilahbusiness-design/DISCORDFC` sebagai rebuild Football Rising Star di Discord. Jangan mengklaim parity numerik 1:1 karena source C# dan backend asli belum tersedia; gunakan konfigurasi modular dan golden tests ketika data resmi diberikan.

## Perubahan yang sudah dibuat

Repository sebelumnya kosong. Codebase sekarang menggunakan Node.js 22, TypeScript, discord.js v14, PostgreSQL optional, dan JSON fallback development. Career player memiliki GK/DF/MF/FW, abilities, level/EXP, training, HP/energy recovery, player match, reward, dan career statistics.

Club loop memiliki 16-player roster, rating, formation 4-4-2/4-3-3/3-5-2/5-3-2, tactics balanced/attacking/defensive/counter, assets, prestige, fixtures, standings, league tier, promotion/degradation, season reset, dan Champions League state.

Economy/progression memiliki money, atomic economy ledger, daily reward streak, event choice, market listing, buy/sell transfer, player contract salary/expiry/renewal, achievements, dan claim reward. Maintenance job otomatis melakukan time recovery, event daily, achievement sync, dan contract expiry setiap 15 menit. Admin command dibatasi `ADMIN_USER_IDS`, rate limiter default 12 request per 60 detik per user per process, dan structured logger mencatat operasi tanpa secret.

PostgreSQL adapter memakai transaksi untuk profile + economy ledger. `src/storage/schema.sql`, `pnpm db:migrate`, dan `pnpm db:import-json` tersedia. Dockerfile dan `compose.yaml` menyediakan bot + PostgreSQL. GitHub Actions memvalidasi install lockfile, build, dan test.

## Verifikasi terakhir

`pnpm build` lulus. `pnpm test` lulus dengan **16 test, 0 gagal**. Branch `main` telah dipush ke remote. Commit milestone terbaru `4044316`.

## File penting

`src/domain/engine.ts` adalah career player engine. `src/domain/club-engine.ts` adalah club/league engine. `src/domain/competition-engine.ts` adalah Champions League dan achievements. `src/domain/progression-engine.ts` adalah daily/event/market/economy. `src/domain/contract-engine.ts` adalah contract. `src/jobs/maintenance.ts` adalah time-based maintenance. `src/config/game-balance.ts` adalah formula configuration dengan `source: RECOVERY_INFERRED`. `src/config/seed-data.ts` adalah seed klub/player/market. `src/discord/handlers.ts` adalah Discord adapter. `src/storage/postgres-store.ts` adalah production persistence.

## Yang harus dilakukan berikutnya

Buat Discord Application dan bot, isi secret pada `.env` atau secret manager, jalankan `pnpm commands:register`, dan lakukan live guild test. Migrasikan JSON ke PostgreSQL bila diperlukan. Periksa embed, error handling, permissions, dan rate limit pada guild staging.

Setelah perusahaan memberikan source/config/backend resmi atau hasil pengukuran yang berwenang, ganti seed data dan formula inferred, masukkan club/player IDs resmi, buat golden tests untuk goal calculation/rewards/standings, dan dokumentasikan setiap calibration version. Tambahkan detail honor, reincarnation/retirement, coach statistics, official events, server synchronization, dan backup/restore drill sebelum public launch.

## Batasan keamanan

Jangan memasukkan token Discord, credential database, binary game, atau asset berlisensi ke repository tanpa otorisasi. Jangan menyalin binary IL2CPP ke bot; gunakan kontrak domain dan data resmi yang berwenang.
