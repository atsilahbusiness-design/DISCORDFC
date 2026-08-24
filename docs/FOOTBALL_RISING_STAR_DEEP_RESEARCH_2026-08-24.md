# Riset Mendalam Football Rising Star untuk Parity DISCORDFC

**Tanggal:** 24 Agustus 2026
**Fokus:** Player Mode, Coach Mode, dan Versus/Battle Mode
**Metode:** Cross-check listing resmi, riwayat versi publik, forum komunitas, walkthrough/review video, screenshot publik, dan pemeriksaan repository.
**Prinsip:** Klaim dipisahkan menjadi fakta terverifikasi, evidence visual, laporan komunitas, dan inferensi. Formula server yang tidak terlihat tidak boleh diperlakukan sebagai fakta.

## Ringkasan eksekutif

Riset baru memperkuat kesimpulan bahwa Football Rising Star memiliki **tiga permukaan mode yang terlihat pada build publik tertentu**: Player Mode, Coach Mode, dan Vs Versus Mode. Listing resmi App Store dan Google Play secara tekstual mempromosikan Player dan Coach sebagai dua mode utama, sedangkan screenshot App Store dan dua analisis video publik memperlihatkan label atau alur Versus/Battle. Perbedaan ini kemungkinan berasal dari perbedaan build, waktu rilis, atau cara listing mendeskripsikan produk; karena itu, Versus harus diperlakukan sebagai evidence keberadaan yang kuat tetapi tidak otomatis membuktikan setiap aturan server.[1] [2] [3] [4]

Evidence visual yang paling berguna untuk parity bukanlah formula numerik, melainkan **bentuk pengalaman pengguna**. Player Mode memperlihatkan pembuatan karakter, posisi, atribut makro, detailed skills, EXP, training, trik, kontrak, transfer, achievements, match summary, dan league table. Versus/Battle pada review yang dianalisis memperlihatkan home dengan countdown pertandingan, hasil sebelumnya, online standings, Match Preview, Deal auction, Scout, Sponsor, rewards berbasis posisi liga, ranking list, roster, dan match-result. Namun tidak ada sumber publik yang memperlihatkan secara lengkap seluruh lifecycle Versus dari masuk queue sampai settlement server, sehingga MMR, pairing policy, biaya, cooldown, payout, dan efek Scout/Sponsor tetap tidak terverifikasi.[3] [4]

## Hierarki evidence

| Tingkat | Definisi | Cara memakai dalam repository |
|---|---|---|
| **A — Official direct** | Listing resmi, screenshot resmi, atau release metadata resmi | Dapat menjadi kontrak keberadaan fitur dan bentuk UI, tetapi bukan bukti formula tersembunyi |
| **B — Direct visual recording** | Layar terlihat dalam video gameplay dengan timestamp | Dapat dijadikan target UX dan state surface; harus tetap diberi label versi/build video |
| **C — Public secondary** | Apptopia, APK index, mirror changelog, atau aggregator | Berguna untuk triangulasi riwayat, tetapi tidak cukup sendirian untuk ruleset |
| **D — Community report** | NamuWiki, TapTap, komentar, atau panduan pengguna | Berguna sebagai hipotesis dan edge case; tidak boleh dijadikan formula tanpa konfirmasi |
| **E — Inference/recovery** | Signature client, pola state, atau desain rekonstruksi | Harus memakai ruleset version dan label `RECOVERY_INFERRED` atau `*_INFERRED` |

> **Aturan implementasi:** Evidence bahwa sebuah tombol atau mode pernah ada tidak sama dengan evidence tentang cara server menghitung hasilnya.

## Player Mode

Listing resmi menyatakan bahwa Player Mode dimulai dari pemain berbakat berusia 15 tahun yang bergabung dengan klub profesional. Karier berlangsung selama 20 tahun dan berisi pertandingan, training, transfer, pengembangan football skills, serta usaha memenangkan championship. Listing juga menyebut bahwa gameplay dirancang cepat dan tidak membutuhkan operasi yang rumit.[1] [2]

Walkthrough publik memperlihatkan beberapa state yang harus dipertahankan dalam adapter Discord: role creation dengan birthplace, avatar, position, dan nickname; dashboard dengan PHY, OFF, DEF, TEC, SPD, dan STA; penggunaan EXP untuk Shooting, Penalty, Heading, Passing, Dribbling, Free Kick, dan Off-ball movement; routine training, trick training, serta physical development tiers; kontrak, salary, transfer, negotiation; achievement/trophy room; lineup; match result; player rating; Man of the Match; league table; dan informasi klub.[3]

NamuWiki menambahkan laporan komunitas mengenai injury/recovery pressure, lima major European leagues beserta third division, Q-League yang dipahami sebagai kompetisi Champions-like, forced retirement sekitar usia 34, dan rebirth yang mempertahankan uang dengan progression reset atau bonus tertentu. Karena halaman tersebut merupakan kontribusi komunitas dan sebagian teks adalah terjemahan, temuan ini sebaiknya dipakai untuk test scenario atau konfigurasi yang dapat diubah, bukan sebagai angka immutable.[7]

**Implikasi untuk DISCORDFC:** Fondasi Player Mode yang sekarang sudah sejalan dengan evidence pada level state dan loop. Peningkatan paling aman adalah memperkaya embed dan event summary agar menampilkan detailed skills, contract/transfer context, injury duration, Man of the Match, match statistics, achievements, serta retirement/rebirth history secara lebih eksplisit. Jangan mengubah coefficient hanya karena angka pada video terlihat sebagai rating UI.

## Coach Mode

Listing resmi menggambarkan Coach Mode sebagai kelanjutan hidup seorang retired star yang memulai coaching road. Pengguna dapat berurusan dengan klub besar, membangun mother team menjadi tim kuat, dan memakai formation serta tactics yang berubah-ubah untuk mengejar puncak.[1] [2]

Evidence komunitas menggambarkan Coach sebagai mode manajemen yang terkait dengan klub, liga, fixture, formasi, taktik, trofi, dan capaian. Riset ini tidak menemukan publikasi yang cukup untuk membuktikan formula job offer, club strength, sponsor income, promotion/relegation, atau season settlement secara numerik. Implementasi deterministic Coach di DISCORDFC sudah tepat secara engineering karena memungkinkan replay dan kalibrasi tanpa mengklaim angka asli.

**Implikasi:** Pertahankan isolasi Coach aggregate dari Player dan Versus. Fokus parity berikutnya sebaiknya pada event log, job offer presentation, fixture/standing visibility, season transition, honors, dan rebirth state. Semua coefficient tetap versioned dan diberi label inferred sampai ada data primer.

## Versus/Battle Mode

### Evidence keberadaan dan struktur UX

App Store screenshot resmi memperlihatkan layar awal yang memuat label Player Mode, Coach Mode, dan Versus Mode. Review video kedua yang dianalisis melaporkan Versus footage sekitar 13:25–19:11, dengan home yang menampilkan next-match countdown, previous result, dan online league standing. Pada 14:27–14:54 terlihat Match Preview yang membandingkan team strength, attack/defense, dan core players. Temuan ini mendukung desain Versus sebagai pengalaman **asynchronous scheduled competition**, bukan sekadar command duel satu kali.[1] [4]

Review yang sama melaporkan layar berikut: Deal tab dengan time-limited auction sekitar 16:52; Scout sekitar 15:55–16:24; Sponsor sekitar 16:32–16:36 dengan label Junior, Senior, dan Top; rewards berdasarkan final league position sekitar 17:11; ranking list sekitar 18:11–18:24; roster dengan formation, player rating, stamina, dan morale; serta match-result dengan score, player ratings, possession, shots, shots on target, dan corners.[4]

### Riwayat fitur

Riwayat versi publik sekunder melaporkan bahwa battle mode pada version 2.2.0 menambahkan name change dan gold coin exchange. Riwayat lain dan hasil pencarian metadata menyebut penambahan group code, advanced Scout, serta player-status improvement pada battle mode. Listing resmi yang dibuka langsung untuk version 2.8.0 hanya memperlihatkan catatan umum “Fixed several bugs”, sehingga riwayat sekunder tersebut menguatkan **feature existence/history**, bukan biaya, cooldown, efek, atau algorithm.[1] [5] [6]

### Matchmaking dan competition

Video memperlihatkan Match Preview dan online standings, sementara community/recovery evidence mendukung adanya season, group, league grade, fixture identity, home/away battle, two-half battle, roster condition, cards/injury/status, MVP, summary, dan rewards. Namun riset publik belum menemukan layar atau dokumentasi yang membuktikan bahwa matchmaking memakai MMR tertentu, bagaimana rating diperbarui, apakah lawan manusia selalu real-time, atau berapa kapasitas group dan durasi season.

**Keputusan parity:** Sistem-managed matchmaking pada DISCORDFC merupakan adaptasi yang aman dan konsisten dengan evidence asynchronous. Queue TTL, widening window, deterministic assignment, system club assignment, season standings, dan two-half match simulation boleh dipertahankan sebagai `RECOVERY_INFERRED`, bukan diklaim sebagai formula asli.

### Deal auction

Deal auction memiliki evidence visual langsung dari review video dan evidence historis battle mode. Implementasi escrow/reservation, `BID_RELEASED`, idempotent settlement, immutable player snapshot, dan ledger audit di DISCORDFC merupakan peningkatan engineering yang aman. Riset tidak menemukan price curve, refresh interval, number of listings, minimum increment, atau currency conversion yang otoritatif. Karena itu, nilai tersebut harus tetap configurable dan versioned.

### Scout dan Sponsor

Riset sekarang memberikan evidence visual yang lebih kuat bahwa Scout dan Sponsor bukan sekadar istilah hasil recovery: keduanya terlihat sebagai layar/sub-feature dalam review video. Scout tampak terkait pencarian pemain berdasarkan parameter; Sponsor tampak memiliki tier Junior/Senior/Top dan memberi cash/coin injection menurut analisis video.[4] Akan tetapi, tidak tersedia data cukup untuk menetapkan biaya, eligibility, cooldown, payout, duration, reroll behavior, atau apakah efek Scout bersifat deterministic/random.

**Rekomendasi:** ubah Scout/Sponsor dari preview statis menjadi **evidence-safe interactive preview** yang menampilkan tier, parameter, dan status “rules pending verification”, atau implementasikan hanya state machine tanpa coefficient. Jangan mengurangi coin, memberi boost status, atau menghasilkan payout permanen sampai ada screenshot lengkap, screen recording dengan angka, atau data dari tim produk.

## Perbandingan evidence dengan DISCORDFC

| Surface | Evidence publik baru | Status DISCORDFC | Gap aman berikutnya |
|---|---|---|---|
| Player creation | Usia 15, birthplace/avatar/position/nickname terlihat | Sebagian besar sudah dimodelkan | Perkaya Discord onboarding dan summary |
| Player dashboard | PHY/OFF/DEF/TEC/SPD/STA, skills, EXP | Domain sudah memiliki macro dan detailed skills | Tampilkan layar ringkas yang lebih dekat dengan struktur asli |
| Training/tricks | Routine, trick, physical tiers, EXP allocation | Sudah ada | Tambahkan result receipt dan cooldown/status presentation bila terverifikasi |
| Contract/transfer | Salary, contract, transfer, negotiation | Sudah ada | Tambahkan transfer-offer detail dan history |
| Coach management | Club, formations, tactics, career transition | Sudah ada dan deterministic | Perkaya season/job/event UX |
| Versus Home | Countdown, last result, standings | Sudah ada | Tambahkan scheduled status dan notification queue |
| Match Preview | Perbandingan strength dan core players | Belum penuh sebagai UX surface | Tambahkan read-only preview dari locked snapshots |
| Deal auction | Time-limited Deal tab dan bid | Economy sudah kuat | Tambahkan countdown/outbid/settlement notifications |
| Scout | Parameter-based player search | Preview/evidence-safe only | Jangan aktifkan cost/effect sebelum evidence primer |
| Sponsor | Junior/Senior/Top tier | Preview/evidence-safe only | State machine tanpa payout sampai rules terverifikasi |
| Ranking/rewards | Ranking list dan rewards by final position | Standings/rewards sudah ada | Selaraskan embed dengan canonical rank dan receipt |
| Match result | Score, ratings, possession, shots, corners | Domain result ada | Tambahkan full result card dan MVP/statistics |

## Temuan yang mengubah prioritas implementasi

Pertama, **Versus UX lebih terbukti daripada formula Versus**. Oleh sebab itu, prioritas berikutnya seharusnya bukan menebak MMR atau payout, melainkan menyamakan state visibility: home countdown, Match Preview, Deal countdown, Scout/Sponsor surface, standings, rewards receipt, dan result statistics.

Kedua, **background processing memang diperlukan**. Video memperlihatkan countdown dan scheduled competition, sedangkan recovery evidence menyebut time-driven processing. Worker yang baru ditambahkan ke DISCORDFC adalah arah yang benar, tetapi deployment production masih memerlukan worker lease atau single-instance guarantee, terutama bila lebih dari satu bot process berjalan.

Ketiga, **market abuse dan concurrency harus diuji sebagai operational property**. Forum TapTap memuat panduan pengguna yang tampak membahas save-copy atau cara mempertahankan pemain setelah bid. Itu kemungkinan exploit atau perilaku client-specific, bukan intended mechanic. DISCORDFC sebaiknya tetap memakai ledger, reservation, CAS, idempotency, dan audit trail, bukan meniru exploit tersebut.[8]

Keempat, **perbedaan listing resmi versus video harus dicatat, bukan dipaksa menjadi satu narasi**. Official store text menyebut dua unique modes, tetapi official screenshot dan video menampilkan Versus/battle. Perbedaan ini paling aman diperlakukan sebagai perbedaan product description/version surface. Repository tidak boleh menghapus Versus hanya karena deskripsi singkat resmi tidak menyebutnya.

## Rekomendasi implementasi berurutan

| Urutan | Pekerjaan | Status aturan |
|---:|---|---|
| 1 | Tambahkan Match Preview read-only dari roster snapshot, strength summary, dan opponent label | Aman; bentuk UI terlihat, formula strength tetap inferred |
| 2 | Tambahkan worker notification queue untuk countdown, match result, outbid, settlement, dan season reward | Aman; tidak mengubah formula |
| 3 | Tambahkan Deal countdown dan auction receipt dengan available/reserved/total coin | Aman; memakai economy yang sudah ada |
| 4 | Tambahkan full Versus result card: score, ratings, MVP, possession, shots, corners, cards | Aman untuk output shape; formula tetap inferred |
| 5 | Tambahkan PostgreSQL integration tests untuk concurrent bid, outbid, expiry, settlement, dan retry | Wajib sebelum public launch |
| 6 | Tambahkan worker lease/coordination dan idempotent job records untuk multi-instance | Wajib bila deployment dapat menjalankan lebih dari satu process |
| 7 | Tambahkan Scout/Sponsor state machine dalam preview mode | Aman bila tidak menetapkan biaya/efek/payout |
| 8 | Aktifkan Scout/Sponsor economy hanya setelah evidence primer tersedia | Ditunda |
| 9 | Kalibrasi MMR, payout, cooldown, dan price curve dari data resmi atau black-box test yang diizinkan | Ditunda; jangan diinferensikan dari satu video |

## Kesimpulan

Riset mendalam ini memperkuat bahwa DISCORDFC sudah memiliki fondasi gameplay yang masuk akal dan sebagian besar state penting Player, Coach, dan Versus. Perbedaan terbesar dengan game asli sekarang bukan lagi ketiadaan konsep utama, melainkan **kelengkapan UX Versus dan kepastian ruleset server**. Versus Home, countdown, Match Preview, Deal, Scout, Sponsor, rewards, ranking, dan result statistics perlu diprioritaskan sebagai surface yang dapat dilihat pengguna.

Pada saat yang sama, tidak ada dasar evidence yang cukup untuk menyatakan bahwa formula MMR, matchmaking, auction pricing, Scout, Sponsor, status boost, payout, atau cooldown DISCORDFC sudah sama dengan server asli. Dengan mempertahankan label ruleset, audit ledger, deterministic replay, dan batas evidence, proyek dapat bergerak menuju closed beta secara aman tanpa mengubah dugaan menjadi klaim palsu.

## References

[1]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Official Apple App Store listing"

[2]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Official Google Play listing"

[3]: https://www.youtube.com/watch?v=hBakdDdTCQw "Football Rising Star X7GAME walkthrough — public video analyzed"

[4]: https://www.youtube.com/watch?v=KQiUcv9d25c "Football Rising Star review (Android game, 2021) — public video analyzed"

[5]: https://football-rising-star.soft112.com/ "Football Rising Star 2.8.0 — public version-history aggregator"

[6]: https://apptopia.com/ios/app/1585604439/about "Football Rising Star — public iOS app history"

[7]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — NamuWiki community reference"

[8]: https://www.taptap.cn/app/220982/topic?page=16 "Football: Rising Star — TapTap official forum index"
