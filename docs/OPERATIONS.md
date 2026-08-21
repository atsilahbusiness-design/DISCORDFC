# Operations Runbook

## Release checklist

Sebelum release, jalankan `pnpm install --frozen-lockfile`, `pnpm build`, dan `pnpm test`. Pastikan `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, dan `ADMIN_USER_IDS` disimpan pada secret manager atau environment host, bukan di repository. Untuk production database, jalankan migration sebelum bot baru dinyalakan.

```bash
pnpm db:migrate
pnpm commands:register
pnpm build
pnpm start
```

Untuk Compose, jalankan service database lebih dahulu, build image, jalankan migration one-shot, kemudian start service bot. Periksa structured log `bot_ready` dan pastikan nilai persistence adalah `postgresql`.

## Backup dan restore

Backup PostgreSQL minimal sekali per hari menggunakan `pg_dump` ke storage terenkripsi. Uji restore secara berkala ke database staging sebelum menganggap backup valid. Bila masih menggunakan JSON development fallback, backup file yang ditunjuk `DATA_FILE`; JSON store melakukan penulisan atomik melalui temporary file lalu rename.

## Rollback

Rollback aplikasi dilakukan dengan menjalankan image atau commit sebelumnya setelah memastikan schema kompatibel. Jangan menghapus data database saat rollback aplikasi. Rollback migration yang destruktif harus memiliki migration reverse atau restore backup yang telah diverifikasi.

## Monitoring

Structured logger menghasilkan event `bot_ready`, `shutdown_requested`, `maintenance_completed`, `maintenance_failed`, dan `command_failed`. Monitor proses Node, koneksi database, latency command, jumlah command error, dan kegagalan maintenance. Rate limiter saat ini in-memory per instance; pada multi-instance, pindahkan bucket ke Redis atau database.

## Security

Token Discord harus dianggap credential berisiko tinggi. Jangan mengirim token lewat chat atau commit. `ADMIN_USER_IDS` membatasi fungsi maintenance, tetapi akses host dan secret manager tetap harus dibatasi melalui IAM. Untuk server publik, gunakan PostgreSQL managed dengan TLS, backup terenkripsi, dan network policy yang hanya mengizinkan koneksi bot.

## Data migration

Untuk mengimpor data JSON ke database production, siapkan `DATABASE_URL` dan `DATA_FILE`, jalankan `pnpm db:migrate`, lalu `pnpm db:import-json`. Proses import menggunakan upsert profile dan menulis ulang economy ledger secara transaksional per profile. Periksa jumlah row sebelum dan sesudah import.

## Known parity gap

Simulator dan data seed masih merupakan rebuild berbasis recovery. Formula resmi, roster resmi, club IDs, event payload, market backend, dan sinkronisasi server belum dapat dinyatakan identik tanpa source/config/backend internal perusahaan. Semua perubahan balance harus disertai golden test dan catatan provenance.
