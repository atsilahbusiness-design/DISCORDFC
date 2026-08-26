# Handoff Prompt — DISCORDFC Gameplay Parity

Gunakan repository `DISCORDFC` sebagai sumber kebenaran. Tujuan proyek adalah merekonstruksi Football Rising Star di Discord untuk tiga aggregate yang terisolasi: **Player**, **Coach**, dan **Versus/Battle**. Jangan menyatakan pixel-perfect atau formula identik dengan game asli. Semua formula yang belum dibuktikan oleh output primer harus tetap configurable, deterministic, versioned, dan diberi label `RECOVERY_INFERRED`/`*_INFERRED`.

## Perubahan yang sudah diterapkan

Player weekly loop sekarang memiliki stage eksplisit `READY → MATCH_READY → EXP_PENDING → READY`, dengan `SEASON_BREAK` setelah annual award. `preparePlayerWeek` menjalankan weekly update, recovery, trainer settlement, dan injury settlement. `playPreparedWeek` menjalankan match dan menghasilkan pending match EXP. `advanceWeek` tetap dipertahankan sebagai compatibility wrapper agar caller internal lama tidak langsung rusak.

Discord memiliki root `/play` sebagai entry utama Game Home. Dari sana user dapat memilih Player, Coach, atau Versus. Player creation memilih posisi melalui select menu. Player Home menyediakan tombol Profile, Train, Weekly Update, Play match, Club Office, dan mode navigation. Pending match EXP dapat dialokasikan melalui select menu. Coach Home menyediakan Coach Profile, Play Round, Club Office, Board/Event, dan event-choice selector. Versus Home dan lineup builder tetap menggunakan owner-bound buttons/selects.

Acknowledgement component diperbaiki: `InteractionCreate` melakukan acknowledgement terpusat, sedangkan `handleComponent` hanya defer bila interaction belum di-acknowledge. Ini menghilangkan double-defer yang sebelumnya dapat membuat button/select flow gagal.

Worker Versus sekarang memproses round yang telah melewati `roundDeadline` secara otomatis melalui `processVersusRound`, mengunci group operation dengan lifecycle yang sudah ada, dan melakukan `settleVersusSeason` setelah seluruh round selesai. Expired market settlement tetap diproses dalam worker yang sama. Queue policy, MMR, timer asli, Scout, Sponsor, price curve, dan payout masih evidence-limited atau inferred.

Dokumentasi evidence dan matrix utama berada di:

- `docs/TECHNICAL_GAMEPLAY_STATE_MATRIX_2026-08-26.md`
- `docs/research-evidence-2026-08-24.md`
- `docs/FOOTBALL_RISING_STAR_DEEP_RESEARCH_2026-08-24.md`
- `docs/DISCORD_COMMAND_LAYOUT.md`

Trace video yang dianalisis tersimpan sebagai Markdown sanitized:

- `video_sS5T8E43LQI_analysis_20260826_091732.md`
- `video_YruDaaeriNM_analysis_20260826_091857.md`

Jangan menambahkan raw client archive, proprietary assets, `.env`, token, API key, `node_modules`, `dist`, database data, atau credential apa pun ke commit maupun package delivery.

## Verifikasi terakhir

Build TypeScript berhasil. Suite test berhasil dengan **73 tests passing**. Production dependency audit tidak menemukan vulnerability high. `git diff --check` bersih. Stress simulation berhasil pada 300 trials per mode, 115.770 actions total, dengan **0 invariant failures** dan **0 determinism failures**.

Registrasi Discord belum diulang dari sandbox setelah `/play` ditambahkan karena credential tidak tersedia di environment saat audit akhir. Jalankan registrasi hanya dari environment deployment yang aman dengan credential yang valid, lalu verifikasi jumlah root command menjadi enam: `/play`, `/player`, `/coach`, `/versus`, `/help`, `/admin`. Jangan menjalankan gateway kedua pada host yang sama.

## Langkah lanjutan yang disarankan

Pertama, lakukan integration test adapter dengan mock `ButtonInteraction` dan `StringSelectMenuInteraction` untuk memverifikasi bahwa interaction yang sudah deferred tidak didefer dua kali, serta bahwa `menu-player`, `menu-coach`, `menu-versus`, `player-create-select`, `pending-exp-select`, dan `coach-event-select` tidak dapat dipakai user lain.

Kedua, siapkan persistent low-latency host untuk Discord gateway. Sandbox sebelumnya menunjukkan REST acknowledgement latency sekitar 2,8–6,0 detik dan tidak boleh dianggap sebagai bukti bahwa production gateway aman. Gunakan telemetry `interaction_received`, `interaction_acknowledged`, dan `interaction_ack_failed` untuk mengukur deployment sebenarnya.

Ketiga, lakukan UX review melalui satu `/play` pada deployment yang sudah memiliki command registry terbaru. Fokus pada urutan Player weekly update → match → EXP allocation → standings, Coach hub → round/event, serta Versus countdown → lineup lock → automatic result. Jangan meminta user mengulang banyak command untuk menguji flow yang sama.

Keempat, sebelum mengubah balance, cari evidence primer tambahan untuk resource drain, recovery timers, weekly/season calendar, forced retirement, Versus assignment, league size, Deal/Scout/Sponsor economics, dan ranking tie-breaker. Jika evidence tetap tidak tersedia, ubah hanya ruleset inferred yang eksplisit dan tambahkan test determinism/invariant.
