# Professional Architecture and Product Roadmap

Tanggal: 2026-08-21. Dokumen ini menerjemahkan audit codebase, riset platform, game economy, security, dan operations menjadi target engineering yang dapat diverifikasi.

## Definition of done

Versi production dianggap siap untuk closed beta apabila seluruh mutation game memiliki persistence yang atomic dan conflict-safe, command yang berpotensi lambat menggunakan deferred interaction, command admin dibatasi oleh permission native Discord dan allowlist aplikasi, dan tidak ada token, message content, atau data pribadi yang dicatat ke log. Simulasi utama harus deterministic ketika menerima seeded random source, seluruh currency mutation harus masuk ledger, dan test suite harus mencakup golden balance cases, replay/idempotency, migration, dan failure recovery.

Versi open beta dianggap siap apabila profile, club, fixture, market, contract, achievement, daily/event, league, dan Champions League memiliki UX yang dapat dimainkan tanpa membaca dokumentasi panjang; event ekonomi dapat direkonsiliasi; PostgreSQL backup dan rollback telah diuji; dashboard metrics tersedia; dan staged guild rollout menunjukkan error rate serta latency yang stabil.

## Target architecture

Arsitektur target terdiri dari domain engine murni, application services untuk use-case dan transaction boundary, adapter Discord untuk command/component interaction, repository persistence, shared economy services, dan jobs yang aman dijalankan ulang. Domain engine tidak boleh mengimpor Discord, PostgreSQL, atau environment variable. Semua perubahan state harus melalui service yang menghasilkan `GameEvent`/ledger entry dan repository yang memiliki concurrency control.

Discord UX sebaiknya berkembang dari command-heavy menjadi dashboard interaktif: `/career` menampilkan profile dan tombol `Train`, `Match`, `Club`, `Market`; select menu dipakai untuk ability/formasi/taktik; autocomplete dipakai untuk official club/player ID; modal dipakai untuk input yang panjang. Buttons dan selects memiliki custom ID yang unik serta batas nilai yang harus dihormati [1] [2]. Command yang lama tetap dipertahankan sebagai compatibility layer.

## Product pillars

| Pilar | Target pengalaman | Ukuran keberhasilan |
|---|---|---|
| Career | Pemain merasakan perkembangan posisi, ability, morale, contract, dan statistik | D1/D7 activation dan completion first-match dapat diukur |
| Club | Roster, formation, tactics, fixture, standings, promotion, dan Champions League membentuk metagame | Setiap season memiliki keputusan bermakna, bukan hanya klik simulasi |
| Economy | Money memiliki sources dan sinks yang transparan dan dapat dikalibrasi | Net mint/sink, median balance, price index, dan time-to-upgrade dipantau |
| Social | League server, rival, co-op, dan leaderboard bersifat opt-in serta privacy-aware | Participation tanpa membuka profil personal yang tidak diperlukan |
| Live operations | Event dan balance dapat diubah melalui config/version, bukan code redeploy | Rollout dan rollback config dapat dilakukan dengan audit log |

## Prioritas engineering

| Urutan | Perbaikan | Alasan |
|---:|---|---|
| P0 | Shared market/economy service dan ledger reconciliation | Market per profile saat ini tidak membentuk multiplayer economy yang konsisten |
| P0 | Application service + transaction boundary + idempotency | Mencegah lost update, double reward, dan partial mutation |
| P0 | Deferred Discord responses dan component dashboard | Mengurangi interaction timeout serta friction UX |
| P0 | Security/permission hardening | Mengurangi risiko admin misuse, excessive data, dan abuse |
| P1 | Golden simulator dan balance telemetry | Formula inferred harus bisa dikalibrasi tanpa regresi |
| P1 | Season content, social league, rivalry, and co-op | Menambah alasan kembali selain daily reward |
| P1 | Backup/restore drill dan staged rollout | Production readiness harus dibuktikan, bukan hanya terdokumentasi |
| P2 | Asset-rich embeds, localization, cosmetics, and monetization | Dikerjakan setelah fairness, privacy, dan economy baseline stabil |

## KPI teknis dan game

| Domain | KPI awal | Guardrail |
|---|---|---|
| Discord | Interaction acknowledgement cepat; p95 mutation selesai < 2 detik pada seeded local test | Defer sebelum DB/maintenance operation; log command latency |
| Reliability | Mutation error < 0,5% pada closed beta | Retry hanya pada operasi idempotent; conflict menghasilkan retry user-safe |
| Economy | Semua money delta memiliki ledger entry; net source/sink dapat direkonsiliasi harian | Tidak ada negative balance; price/earnings config tervalidasi |
| Fairness | Tidak ada double claim/buy pada replay interaction | Idempotency key dan optimistic concurrency |
| Privacy | Bot hanya menerima Guilds intent; tidak membaca message content | Log tidak menyimpan isi message atau profil lintas guild |
| Retention | First-session completion, D1/D7, median sessions/week | Daily reward tidak memaksa FOMO; catch-up window dan optional goals |

## Deployment options

| Opsi | Kelebihan | Kekurangan | Keputusan |
|---|---|---|---|
| Cloud VM + Docker Compose + managed PostgreSQL | Cocok untuk Discord Gateway yang persistent, kontrol penuh atas process, volume, logs, dan scheduler | Tim perlu mengelola patching, backup verification, dan alerting | **Rekomendasi closed beta** |
| Managed container service dengan satu long-running worker + external PostgreSQL | Deployment/rollback lebih mudah, health check dan secret management biasanya lebih baik | Harus memastikan service tidak scale-to-zero dan mendukung persistent WebSocket process; biaya dapat meningkat | Layak untuk open beta setelah load test |
| Serverless request function | Scaling otomatis dan biaya idle rendah | Tidak cocok untuk Discord Gateway worker, maintenance loop, dan in-memory coordination | Tidak direkomendasikan sebagai bot utama |

Untuk closed beta, gunakan satu worker bot, satu PostgreSQL primary, backup terjadwal, dan Docker Compose di VM. Setelah metrics menunjukkan kebutuhan scale, pindahkan worker ke managed container dengan distributed lock, shared rate limit, dan job scheduler terpisah. Discord sendiri menyarankan agar rate limit tidak di-hard-code dan client menghormati headers/`retry_after` [3].

## Guardrails produk

Daily rewards harus diperlakukan sebagai optional progression, bukan kewajiban. Riset ACM menemukan bahwa engagement rewards dapat dirasakan sebagai motivasi, tetapi juga sebagai FOMO, obligation, atau chore [4]. Karena itu, gunakan streak recovery, catch-up, dan weekly goals yang tidak menghukum absensi.

Economy harus memiliki telemetry sources/sinks dan simulasi spreadsheet atau script. Unity menyarankan pengujian terhadap initial currency, periodic rewards, cooldown energy, cost progression, dan reward progression [5]. GDC juga menekankan penggunaan sink yang efektif untuk mencegah inflasi dan simulasi dampak sink [6]. Jangan membuka loot box berbayar atau monetization power advantage sebelum balance dan compliance review.

Security mengikuti OWASP: allowlist input, strict authorization untuk object/function, resource limits, activity logging, dependency hygiene, dan error handling [7] [8]. Privacy mengikuti minimisasi data; riset USENIX menunjukkan bot group-chat dapat mengakses lebih banyak konteks daripada yang dibutuhkan sehingga bot ini harus mempertahankan Guilds-only intent dan tidak menyimpan message content [9].

## References

[1]: https://docs.discord.com/developers/components/reference "Discord Component Reference"
[2]: https://docs.discord.com/developers/components/using-message-components "Discord Using Message Components"
[3]: https://docs.discord.com/developers/topics/rate-limits "Discord Rate Limits"
[4]: https://doi.org/10.1145/3549489 "Daily Quests or Daily Pests? The Benefits and Pitfalls of Engagement Rewards in Games"
[5]: https://unity.com/how-to/design-balanced-in-game-economy-guide-part-3 "Unity Designing a Balanced In-Game Economy"
[6]: https://gdcvault.com/play/1020524/Economic-Balancing-and-Improved-Monetization "GDC Economic Balancing and Improved Monetization Through Clever Sink Design"
[7]: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html "OWASP Node.js Security Cheat Sheet"
[8]: https://owasp.org/www-project-api-security/ "OWASP API Security Project"
[9]: https://www.usenix.org/conference/usenixsecurity25/presentation/chou "USENIX Bots can Snoop"
