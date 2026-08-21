# Football Rising Star Discord Bot

Bot Discord ini adalah **MVP porting fungsional** dari konsep Football Rising Star ke interaksi berbasis slash command. Repository target sebelumnya kosong, sehingga fondasi proyek dibuat dari awal dengan pemisahan antara engine game, penyimpanan state, dan adapter Discord.

> Arsip game yang tersedia merupakan build Unity IL2CPP hasil recovery, bukan source C# asli. Karena itu, implementasi ini meniru struktur domain dan alur gameplay yang terlihat dari `dump.cs`, bukan menyalin binary atau mengklaim kesamaan formula numerik 1:1.

## Fitur MVP

MVP saat ini menyediakan onboarding profil pemain dengan posisi GK/DF/MF/FW, atribut dasar yang berbeda berdasarkan posisi, ability dan level, training yang mengonsumsi energi, pemulihan HP/energi berbasis waktu, simulasi pertandingan deterministik-seeded, hadiah money/EXP, statistik karier, dan progres musim pribadi. State profil disimpan secara atomik dalam `data/players.json` agar tetap tersedia setelah restart bot.

| Command | Fungsi |
| --- | --- |
| `/start position:FW` | Membuat profil pemain baru |
| `/profile` | Melihat rating, kondisi, ability, dan statistik karier |
| `/train ability:technique` | Melatih satu ability dan memperoleh EXP |
| `/match` | Memainkan pertandingan berikutnya dan memperoleh reward |
| `/league` | Melihat season, matchday, poin, rekor, dan gol |
| `/help` | Melihat panduan singkat |

## Arsitektur

Engine pada `src/domain/engine.ts` tidak bergantung pada Discord sehingga dapat diuji dan dikalibrasi secara mandiri. `src/storage/json-store.ts` bertanggung jawab atas persistence MVP. `src/discord/handlers.ts` menerjemahkan slash command menjadi operasi domain dan embed Discord. `src/discord/register-commands.ts` mendaftarkan command ke guild tertentu ketika `DISCORD_GUILD_ID` tersedia, atau secara global jika tidak tersedia.

Struktur proyek utama adalah sebagai berikut:

```text
src/
  domain/
    engine.ts             # Profile, training, recovery, match, league
    types.ts              # Kontrak data domain
  discord/
    commands.ts           # Slash command definitions
    handlers.ts           # Discord interaction adapter
    register-commands.ts  # Command registration
  storage/
    json-store.ts         # Atomic JSON persistence
  index.ts                # Bot entry point
test/
  engine.test.ts          # 5 automated tests
data/
  .gitkeep                # Runtime state is intentionally ignored
```

## Menjalankan secara lokal

Pastikan Node.js 22 atau versi yang lebih baru tersedia. Kemudian instal dependensi dan salin environment template:

```bash
pnpm install
cp .env.example .env
```

Isi `DISCORD_TOKEN` dengan token bot dan `DISCORD_CLIENT_ID` dengan application ID. Untuk pengujian cepat pada satu server, isi `DISCORD_GUILD_ID`; command guild akan diperbarui lebih cepat daripada command global. Jalankan registrasi command dan bot:

```bash
pnpm commands:register
pnpm dev
```

Untuk build production:

```bash
pnpm build
pnpm start
```

Aplikasi Discord dibuat melalui Developer Portal Discord. Pada saat mengundang bot ke server, gunakan scope `bot` dan `applications.commands`; dokumentasi OAuth2 Discord menjelaskan bahwa `applications.commands` memungkinkan aplikasi menambahkan command ke guild dan tercakup secara default dalam scope bot [1].

## Pengujian

Test engine dapat dijalankan tanpa token Discord:

```bash
pnpm test
```

Test mencakup pembuatan profil berbasis posisi, konsumsi energi dan EXP saat training, pemulihan berbasis timestamp, hasil pertandingan beserta reward dan klasemen, serta persistence atomik. Hasil terakhir yang diverifikasi: **5 test lulus, 0 gagal**.

## Pilihan menjalankan bot online

Bot Discord harus dijalankan pada proses yang selalu aktif agar dapat menerima event dari Discord. Dua jalur yang layak adalah sebagai berikut.

| Pilihan | Trade-off | Biaya/setup |
| --- | --- | --- |
| Menjalankan pada komputer kantor atau server yang sudah dimiliki | Setup paling ringan dan kontrol penuh, tetapi mesin dan koneksi internet harus selalu aktif; perlu process manager seperti systemd atau Docker Compose | Biaya infrastruktur yang sudah ada; setup rendah sampai menengah |
| Men-deploy ke hosting Node.js/VPS managed | Lebih stabil dan independen dari komputer kantor, mudah ditambah database produksi, tetapi memerlukan konfigurasi secret, logging, restart policy, dan biaya hosting | Biaya mengikuti provider; setup menengah |

Untuk MVP, komputer kantor/server yang sudah tersedia cukup untuk pengujian tertutup. Untuk produksi multi-server atau jumlah pemain besar, ganti JSON store dengan PostgreSQL atau MySQL, tambahkan migration, rate limiting, audit log, dan job worker yang menangani pemulihan/event secara konsisten.

## Roadmap porting

Fase berikutnya sebaiknya memprioritaskan data konfigurasi asli dan formula resmi yang belum dapat dipastikan dari `dump.cs`: roster klub, formation dan tactics, contract/market, event pilihan, Champions League, transfer, achievement/honor, serta integrasi backend. Formula pertandingan saat ini sengaja dipisahkan agar tim dapat mengganti implementasi simulator tanpa mengubah command Discord ketika formula internal sudah tersedia.

## Keamanan

Jangan menulis token Discord, kredensial database, atau secret backend ke repository. File `.env` dan `data/*.json` telah di-ignore. Bila token pernah terpublikasi, revoke token tersebut di Developer Portal Discord sebelum bot dijalankan kembali.

## Referensi

[1]: https://docs.discord.com/developers/topics/oauth2 "Discord Developer Documentation — OAuth2"
