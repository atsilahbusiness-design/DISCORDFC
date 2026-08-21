# Operations Runbook

## Release checklist

Sebelum release, jalankan `pnpm install --frozen-lockfile`, `pnpm build`, dan `pnpm test`. Jalankan `pnpm audit --prod --audit-level high`, `git diff --check`, secret scan, dan Docker build. Pastikan `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `ADMIN_USER_IDS`, serta credential database disimpan pada secret manager atau environment host, bukan di repository.

Untuk production database, migration harus selesai sebelum gateway menerima traffic. Pada Compose, container bot menjalankan `node dist/storage/migrate.js` lalu `node dist/index.js` setelah PostgreSQL healthcheck lulus. Untuk deployment non-Compose, jalankan:

```bash
pnpm db:migrate
pnpm commands:register
pnpm build
pnpm start
```

Periksa structured log `bot_ready` dan pastikan nilai persistence adalah `postgresql`. Untuk guild testing, gunakan `DISCORD_GUILD_ID` agar command update dapat diverifikasi cepat sebelum global registration.

## Backup dan restore

Backup PostgreSQL minimal sekali per hari menggunakan `pg_dump` ke storage terenkripsi. Backup harus menyertakan checksum, retention policy, dan metadata schema version. Uji restore secara berkala ke database staging; backup yang belum pernah di-restore tidak dianggap tervalidasi. Bila masih menggunakan JSON development fallback, backup file yang ditunjuk `DATA_FILE`; JSON store melakukan penulisan atomik melalui temporary file lalu rename.

Restore drill minimum adalah membuat database kosong, menjalankan schema migration, mengimpor dump, memeriksa jumlah profile/ledger, menjalankan smoke test `/profile`, `/market`, `/daily`, dan `/admin action:stats`, lalu membuang staging database.

## Rollback

Rollback aplikasi dilakukan dengan menjalankan image atau commit sebelumnya setelah memastikan schema kompatibel. Jangan menghapus data database saat rollback aplikasi. Rollback migration yang destruktif harus memiliki migration reverse atau restore backup yang telah diverifikasi. Perubahan balance/config harus memiliki version dan rollback plan terpisah dari binary application.

## Monitoring

Structured logger menghasilkan event `bot_ready`, `shutdown_requested`, `maintenance_completed`, `maintenance_failed`, `discord_client_error`, `unhandled_rejection`, `uncaught_exception`, `command_failed`, dan `component_failed`. Monitor proses Node, koneksi database, latency command, jumlah command error, interaction timeout, conflict error, invalid Discord API response, dan kegagalan maintenance.

Maintenance memiliki overlap guard dan command mutation user yang sama diserialisasi oleh per-user queue. PostgreSQL memakai optimistic concurrency melalui kolom `version`; conflict harus dilaporkan sebagai error user-safe dan tidak boleh di-retry secara buta. Rate limiter saat ini in-memory per instance; pada multi-instance, pindahkan bucket dan queue ke Redis atau database dengan TTL.

## Security

Token Discord harus dianggap credential berisiko tinggi. Jangan mengirim token lewat chat atau commit. Command `/admin` menggunakan default member permission `Manage Guild` dan tetap memeriksa `ADMIN_USER_IDS`. Host, database, dan secret manager harus dibatasi melalui IAM. Bot memakai hanya `Guilds` intent dan tidak membutuhkan message content; jangan menambahkan privileged intent tanpa kebutuhan product dan privacy review.

Log tidak boleh menyimpan token, isi pesan, credential, atau payload profile penuh. Error response kepada user menggunakan pesan yang aman; detail stack hanya masuk structured log. Dependency audit dan secret scan harus menjadi required CI check.

## Data migration

Untuk mengimpor data JSON ke database production, siapkan `DATABASE_URL` dan `DATA_FILE`, jalankan `pnpm db:migrate`, lalu `pnpm db:import-json`. Proses import menggunakan upsert profile dan menulis ulang economy ledger secara transaksional per profile. Periksa jumlah row sebelum dan sesudah import. Pada deployment multi-instance, migration harus dijalankan sebagai one-shot release job, bukan oleh setiap replica secara bersamaan.

## Economy and balance operations

Semua money mutation harus memiliki economy ledger entry. Market user memiliki cooldown refresh enam jam dan admin refresh menggunakan explicit force path. Roster dibatasi 32 pemain dan pembelian duplicate player ditolak. Perubahan reward, energy, price, atau sink harus diuji memakai `pnpm exec tsx scripts/balance-snapshot.ts` dan dibandingkan dengan `docs/BALANCE_SNAPSHOT.md`.

## Known parity gap

Simulator dan data seed masih merupakan rebuild berbasis recovery. Formula resmi, ability dictionary variable-length, event payload lengkap, market backend, dan sinkronisasi server belum dapat dinyatakan identik tanpa source/config/backend internal perusahaan. Semua perubahan balance harus disertai golden test dan catatan provenance.
