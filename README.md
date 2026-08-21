# Football Rising Star Discord Bot

Proyek ini mengembangkan Football Rising Star menjadi pengalaman game berbasis Discord. Versi sekarang sudah melampaui MVP awal: pemain dapat membangun karier, berlatih, memainkan pertandingan, mengelola klub, mengubah formasi dan taktik, mengikuti musim, menjalankan transfer market, mengambil daily reward, menyelesaikan event, menandatangani kontrak, mengejar achievement, dan mengikuti jalur Champions League.

> Paket recovery yang tersedia adalah build Unity IL2CPP, bukan source C# dan backend asli. Karena itu, proyek ini membangun ulang loop game dan kontrak domain yang terlihat dari recovery. Formula yang belum dapat dibaca atau divalidasi dari binary diberi konfigurasi terpusat dan ditandai sebagai `RECOVERY_INFERRED`, bukan diklaim identik 1:1.

## Fitur yang tersedia

| Area | Fitur |
| --- | --- |
| Career | Profil GK/DF/MF/FW, ability, level, EXP, training, HP, energy, player match, reward, career stats |
| Club | Roster, squad rating, formation 4-4-2/4-3-3/3-5-2/5-3-2, tactics balanced/attacking/defensive/counter, assets, prestige |
| Competition | Fixture, matchday, standings, promotion-ready season loop, Champions League knockout state |
| Economy | Money, atomic economy ledger, salary, contract, market listing, buy/sell player |
| Progression | Daily reward streak, daily event choices, achievements, MVP, season scoring |
| Production | PostgreSQL store, schema migration, JSON-to-PostgreSQL import, Docker image, Compose stack, rate limiter, admin stats |

## Slash commands

| Command | Fungsi |
| --- | --- |
| `/start position:FW` | Membuat profil pemain dan klub awal |
| `/profile` | Melihat atribut, kondisi, contract, club rating, dan career stats |
| `/train ability:technique` | Melatih ability dan mengonsumsi energy |
| `/match` | Memainkan pertandingan karier pemain |
| `/club` | Melihat club office, resources, strategy, dan next fixture |
| `/squad` | Melihat roster dan ID pemain |
| `/formation id:4-3-3` | Mengubah formasi klub |
| `/tactic id:attacking` | Mengubah taktik klub |
| `/club-match` | Memainkan fixture klub dan memperbarui standings |
| `/league` atau `/standings` | Melihat klasemen dan progres season |
| `/season-end` | Memulai season berikutnya setelah seluruh fixture selesai |
| `/contract action:sign` | Menandatangani atau memperpanjang kontrak |
| `/daily` | Mengambil daily reward dan menaikkan streak |
| `/event` | Melihat event harian |
| `/event choice:accept` | Menyelesaikan pilihan event |
| `/market action:refresh` | Membuat daftar pemain market |
| `/buy-player listing:listing-market-1` | Membeli pemain dari market |
| `/sell-player player:npc-1` | Menjual pemain non-user dari roster |
| `/champions action:status` | Melihat status Champions League |
| `/champions action:play` | Memainkan ronde Champions League |
| `/achievements` | Melihat progress achievement |
| `/claim-achievement achievement:appearances-10` | Mengklaim achievement yang siap |
| `/admin action:stats` | Statistik operasi, hanya untuk `ADMIN_USER_IDS` |
| `/admin action:refresh-markets` | Refresh market semua profil, hanya admin |
| `/help` | Melihat bantuan command |

## Arsitektur

Engine domain berada di `src/domain/` dan tidak bergantung pada Discord. `engine.ts` menangani career player, training, recovery, dan player match. `club-engine.ts` menangani roster, formation, tactics, fixtures, standings, dan club match. `competition-engine.ts` menangani Champions League dan achievements. `progression-engine.ts` menangani daily reward, event, market, transfer, dan economy ledger. `contract-engine.ts` menangani kontrak. `src/discord/handlers.ts` menjadi adapter interaction Discord.

Persistence memiliki dua mode. Tanpa `DATABASE_URL`, bot memakai `JsonPlayerStore` untuk development lokal. Dengan `DATABASE_URL`, bot memakai `PostgresPlayerStore`. Schema disediakan pada `src/storage/schema.sql`; script migration dan import JSON berada pada `src/storage/migrate.ts` dan `src/storage/import-json.ts`.

## Menjalankan secara lokal

Pastikan Node.js 22 atau versi yang lebih baru tersedia. Instal dependency dan buat environment file:

```bash
pnpm install
cp .env.example .env
```

Isi sekurang-kurangnya `DISCORD_TOKEN` dan `DISCORD_CLIENT_ID`. Untuk pengujian cepat pada satu server, isi `DISCORD_GUILD_ID`. Isi `ADMIN_USER_IDS` dengan Discord user ID admin yang dipisahkan koma apabila command admin akan digunakan.

Mode JSON development:

```bash
# kosongkan DATABASE_URL pada .env
pnpm commands:register
pnpm dev
```

Build production:

```bash
pnpm build
pnpm start
```

## Menjalankan dengan PostgreSQL dan Docker

Compose menyediakan service PostgreSQL lokal dan bot. Ubah password contoh pada `compose.yaml` sebelum dipakai di lingkungan bersama. Setelah `.env` berisi token Discord:

```bash
docker compose up -d db
docker compose build bot
docker compose run --rm bot node dist/storage/migrate.js
docker compose up -d bot
```

Untuk database managed, gunakan `DATABASE_URL` provider tersebut dan jalankan migration dari environment yang dapat mengakses database. Import data JSON lama dapat dilakukan dengan `pnpm db:import-json` setelah `DATABASE_URL` dan `DATA_FILE` diatur.

## Testing dan balance

Perintah berikut menjalankan build dan test:

```bash
pnpm build
pnpm test
```

Test suite saat ini berisi **15 test lulus dan 0 gagal**, mencakup career, club, fixture, standings, daily streak, event, market, transfer, contract, Champions League, achievements, rate limiter, persistence JSON, dan konfigurasi balance.

Nilai gameplay yang masih bersifat sementara berada pada `src/config/game-balance.ts`. Config menyimpan biaya training/match, recovery, reward, peluang gol, versi balance, dan provenance. Saat formula internal sudah tervalidasi, ubah `source` menjadi `OFFICIAL_CALIBRATED`, tambahkan golden tests, dan catat sumber kalibrasi di `docs/PORTING_MAP.md`.

## Deployment dan operasi

Bot Discord membutuhkan proses yang berjalan terus-menerus. Komputer kantor/server yang sudah tersedia cocok untuk internal testing. Hosting Node.js managed atau VPS lebih cocok untuk operasi publik karena dapat menjalankan restart policy, database terpisah, monitoring, backup, dan secret management. Minimal production hardening yang masih direkomendasikan adalah backup PostgreSQL, TLS pada database managed, structured logging, error alerting, command audit log, dan pemisahan admin user ID dari source code.

Command `/admin` dibatasi oleh `ADMIN_USER_IDS`. Rate limiter default membatasi satu user sampai 12 command per 60 detik pada satu proses. Untuk deployment multi-instance, rate limiter perlu dipindahkan ke Redis atau database agar konsisten antar-instance.

## Batasan parity dengan game asli

Recovery memperlihatkan nama type, field, signature method, RVA, asset, dan binary. Recovery tidak menyediakan source C# identik, body method yang mudah dibaca, server data, secret backend, atau seluruh konfigurasi live. Oleh sebab itu, fitur yang sudah dibuat adalah rebuild fungsional yang mendekati loop game, sedangkan kesamaan formula, nilai balance, roster resmi, nama klub resmi, dan sinkronisasi backend memerlukan data perusahaan yang berwenang.

Fase kalibrasi berikutnya sebaiknya memakai source/config/backend internal yang disetujui untuk mengganti balance inferred, memasukkan roster/club data resmi, memvalidasi standings dan reward, serta menambahkan golden tests dari output game asli.

## Referensi

[1]: https://github.com/atsilahbusiness-design/DISCORDFC "Repository DISCORDFC"
[2]: https://docs.discord.com/developers/topics/oauth2 "Discord Developer Documentation — OAuth2"
