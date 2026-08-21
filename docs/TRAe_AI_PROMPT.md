# Handoff Prompt — Football Rising Star Discord Bot MVP

## Konteks

Repository `https://github.com/atsilahbusiness-design/DISCORDFC` sebelumnya kosong. Implementasi awal telah dibuat berdasarkan struktur domain yang terlihat pada paket recovery `FootballRisingStar_2.8.0_Full_Recovery.zip`. Paket recovery adalah build Unity IL2CPP, bukan source C# identik.

## Perubahan yang sudah selesai

Implementasi commit `79e7f4f` menambahkan proyek Node.js 22 + TypeScript + discord.js v14 dengan slash commands `/start`, `/profile`, `/train`, `/match`, `/league`, dan `/help`. Engine domain berada di `src/domain/engine.ts` dan mencakup profil posisi GK/DF/MF/FW, ability, EXP, training, pemulihan HP/energi berbasis timestamp, simulator pertandingan, reward, statistik karier, dan progres season.

`src/storage/json-store.ts` menyediakan persistence JSON atomik untuk MVP. `src/discord/handlers.ts` menjadi adapter interaction Discord. `src/discord/register-commands.ts` mendaftarkan command secara guild-scoped jika `DISCORD_GUILD_ID` diisi atau global bila tidak diisi. `Dockerfile`, `compose.yaml`, `.env.example`, dan `.gitignore` disediakan untuk menjalankan bot dengan secret di luar repository.

## Verifikasi

Perintah `pnpm build` berhasil. Perintah `pnpm test` berhasil dengan 5 test lulus dan 0 gagal. Test meliputi profil berbasis posisi, training, recovery, pertandingan, reward, liga, dan persistence.

## Masalah yang sudah diselesaikan

Repository kosong telah memiliki fondasi yang dapat dijalankan. State tidak hanya berada di memory proses. Token Discord tidak ditulis ke source. Engine dapat diuji tanpa koneksi Discord. Formula simulator dipisahkan dari adapter sehingga dapat diganti tanpa merombak command.

## Hal yang belum diselesaikan

Token Discord, client ID, guild ID, dan server deployment belum dikonfigurasi karena tidak boleh ditulis ke repository. Bot belum diuji terhadap guild Discord live. JSON store belum cocok untuk skala production multi-instance; ganti dengan PostgreSQL/MySQL dan migration sebelum launch publik.

Formula pertandingan adalah formula sementara yang dibangun dari kontrak method dan data field pada dump IL2CPP. Formula tersebut belum terbukti identik dengan game asal. Masih perlu data resmi atau validasi internal untuk formation, tactics, coach score, goal calculation, player selection, market/contract, events, Champions League, achievements/honor, transfer, cooldown, dan backend synchronization.

## Tugas lanjutan yang direkomendasikan

1. Buat Discord Application dan bot di Developer Portal, lalu simpan token di secret manager atau `.env` lokal.
2. Isi `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, dan `DISCORD_GUILD_ID` dari `.env.example`.
3. Jalankan `pnpm commands:register`, kemudian `pnpm dev` untuk uji guild tertutup.
4. Validasi setiap command dan catat output pertandingan.
5. Bekukan schema domain setelah product owner menyetujui MVP.
6. Migrasikan persistence ke database production dan tambahkan migration/backup.
7. Tambahkan data konfigurasi resmi dari backend atau source internal yang berwenang.
8. Ganti formula sementara secara bertahap dengan formula tervalidasi dan tambahkan golden tests.
9. Tambahkan moderation, rate limit, audit log, observability, backup, dan recovery sebelum public launch.

## Batasan dan kepatuhan

Jangan menyalin binary game ke bot atau mempublikasikan aset/secret internal tanpa otorisasi. Gunakan source internal yang sah, dokumentasi, dan data backend yang disetujui perusahaan untuk menyamakan formula dan konten.
