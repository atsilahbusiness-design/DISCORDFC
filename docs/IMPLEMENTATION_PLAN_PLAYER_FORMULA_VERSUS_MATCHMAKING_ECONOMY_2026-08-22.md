# Rencana Implementasi Formula Player dan Versus

**Tanggal:** 2026-08-22
**Status:** Rencana teknis, belum merupakan perubahan gameplay baru
**Tujuan:** Membuat Player Mode dan Versus Mode semakin mirip dengan Football Rising Star tanpa mengarang formula yang belum terbukti dan tanpa menyalin aset atau binary proprietary.

## 1. Prinsip utama

Rencana ini memakai pendekatan **evidence-first**. Listing resmi game mendukung loop Player berupa pemain berusia 15 tahun, bergabung dengan klub profesional, menjalani kompetisi, training, transfer, perkembangan skill, dan karier sekitar 20 tahun. Listing tersebut tidak mempublikasikan koefisien rating, peluang gol, injury chance, reward, atau aturan server Versus.[1] [2] Listing regional Mandarin juga tidak memberikan formula numerik.[3]

Footage publik Versus berguna untuk memverifikasi urutan layar seperti dashboard, lineup, market, Scout, sponsor, reward, ranking, dan jadwal.[4] [5] Bukti komunitas TapTap mengonfirmasi adanya market pemain berbasis koin dalam `对战模式`, tetapi instruksi manipulasi save di dalam posting tersebut **tidak boleh** dijadikan mekanik produk atau aturan resmi.[6]

> **Aturan keputusan:** sebuah angka hanya boleh diberi label `OFFICIAL_CALIBRATED` setelah memiliki sumber resmi atau observasi terkontrol yang dapat diulang. Sebelum itu, angka tetap `RECOVERY_INFERRED`, memiliki versi, dan tidak boleh dipresentasikan sebagai parity asli.

## 2. Baseline DISCORDFC saat ini

### Player Mode

Implementasi Player saat ini sudah memiliki enam macro abilities dan dua belas detailed skills. Rating dihitung dari bobot berbasis posisi, rata-rata detailed skills, dan level. Training mengurangi energy dan memberi EXP acak dalam rentang konfigurasi. Match menggunakan opponent dari recovered club, menghitung rating lawan, mensimulasikan gol, menentukan W/D/L, memberi rating penampilan, reward money/EXP, kartu, assist, clean sheet, injury, dan pending match EXP. `next-week` memulihkan kondisi, menyelesaikan training/event, memproses pertandingan, dan memperbarui career state.

Titik penting yang harus dikalibrasi adalah `calculateRating`, `simulateGoals`, opponent-strength generation, player-score generation, reward table, assist/steal/card/clean-sheet chance, training EXP, level curve, injury duration/chance, weekly recovery, transfer fee/value, dan retirement/rebirth persistence. Seluruh nilai tersebut saat ini berada di `GAME_BALANCE` atau formula domain dan masih berstatus `RECOVERY_INFERRED`.

### Versus Mode

Versus sudah memiliki roster dan wallet terpisah, `VersusMatchmakingTicket`, group/season/battle, lineup submission, formation, tactic, deadline, roster-version guard, settlement dua babak, standings, rewards, reward ledger, atomic batch save, dan group lock. Versus entry seharusnya tetap berasal dari **Versus Mode/Versus Home**; assignment berjalan internal tanpa mengekspos command teknis kepada pengguna.

Kekurangan utamanya adalah queue belum menjadi canonical shared service, aturan MMR dan opponent selection belum ditemukan, serta market Deal, Scout, Sponsor, dan premium currency belum mempunyai ruleset server-authoritative yang terverifikasi.

## 3. Cara melengkapi formula asli Player Mode

### Tahap A — Bangun observation harness sebelum mengganti formula

Formula asli tidak dapat diisi secara bertanggung jawab hanya dari screenshot atau deskripsi store. Kita memerlukan tabel observasi dari game asli atau data resmi. Jika akses ke client asli tersedia secara legal, lakukan pengamatan read-only dan simpan hanya input/output numerik yang diperlukan. Jangan memasukkan texture, binary, credential, atau archive client ke repository.

Harness harus mencatat satu observation sebagai record immutable dengan bentuk konseptual berikut:

```json
{
  "observationId": "player-match-0001",
  "source": "ORIGINAL_CLIENT_CONTROLLED_RUN",
  "clientVersion": "2.8.0",
  "formulaSurface": "PLAYER_MATCH",
  "inputs": {
    "position": "FW",
    "age": 15,
    "level": 1,
    "macroStats": {},
    "detailedSkills": {},
    "hp": 100,
    "energy": 100,
    "opponentRating": 61,
    "formation": "recovered-or-observed"
  },
  "outputs": {
    "score": 7.2,
    "goals": 1,
    "assist": 0,
    "outcome": "WIN",
    "money": 0,
    "exp": 0,
    "injury": null
  },
  "capturedAt": "2026-08-22T00:00:00.000Z"
}
```

Nilai contoh di atas hanya schema, bukan data asli. Observation harus memisahkan input yang benar-benar diketahui dari input yang belum diketahui. Setiap record juga perlu menyimpan confidence, source type, client version, dan apakah hasilnya single-run atau repeated-run.

### Tahap B — Buat matriks eksperimen Player

Matriks harus mengisolasi satu variabel setiap kali. Minimal cakupannya sebagai berikut.

| Surface | Eksperimen terkontrol | Output yang dikumpulkan |
|---|---|---|
| Rating | Naikkan satu detailed skill saja pada setiap posisi | Perubahan rating total dan perubahan statistik pertandingan |
| Macro sync | Naikkan macro ability tanpa mengubah detailed skill, lalu sebaliknya | Apakah rating memakai macro, detailed, atau keduanya |
| Training | Ulangi training pada energy, level, dan skill yang sama | Distribusi EXP, biaya energy, peluang level-up |
| Match outcome | Roster sama melawan beberapa opponent rating | Distribusi W/D/L, gol, player score, assist, kartu, injury |
| Match condition | Ulangi match dengan HP/energy berbeda | Pengaruh condition terhadap availability dan output |
| Position | FW, MF, DF, GK dengan input skill yang diseimbangkan | Bobot posisi dan statistik yang relevan |
| Week progression | Jalankan `Next Week` pada state identik | Recovery, event, injury, training settlement, season cadence |
| Reward | Ulangi outcome identik pada kompetisi berbeda | Money, EXP, premium reward, achievement interaction |
| Career lifecycle | Retirement dan rebirth dengan beberapa usia/karier | Field yang dipertahankan, direset, atau diwariskan |

Setiap kombinasi yang bersifat acak harus dijalankan cukup banyak untuk menghasilkan confidence interval. Jangan mengubah hasil random menjadi formula deterministik hanya karena satu replay menghasilkan angka sama.

### Tahap C — Pisahkan subformula dan lakukan calibration

Jangan mengkalibrasi satu fungsi besar sekaligus. Pecah menjadi modul berversi:

| Modul | Tujuan | Metode kalibrasi |
|---|---|---|
| `ratingFormula` | Menghasilkan rating dari detailed/macro/level/position | Regresi terbatas atau grid search dengan constraint monotonicity |
| `trainingFormula` | Menentukan EXP, energy, duration, dan HP cost | Distribusi empiris per level dan training type |
| `matchStrengthFormula` | Mengubah skill/condition/tactic menjadi attack/defence/impact | Regression dengan position interaction dan opponent control |
| `goalModel` | Menentukan gol dan W/D/L | Binomial/Poisson atau model empiris yang diuji terhadap distribusi asli |
| `performanceModel` | Menentukan player score, assist, steals, cards, clean sheets | Model terpisah per position dan outcome |
| `injuryModel` | Menentukan chance dan duration | Survival/discrete hazard model berdasarkan condition, workload, dan event |
| `rewardModel` | Menentukan money/EXP/achievement reward | Tabel outcome/competition yang versioned |
| `careerModel` | Week, season, transfer, retirement, rebirth | State-transition tests terhadap observation fixtures |

Constraint penting: rating tidak boleh turun ketika input skill relevan naik, biaya tidak boleh menjadi negatif, energy/HP tidak boleh melebihi cap, reward tidak boleh masuk dua kali, dan formula harus deterministic bila seed serta input sama.

### Tahap D — Tambahkan formula versioning dan golden tests

Buat `FormulaVersion` yang disimpan pada setiap match record dan historical reward. Struktur minimalnya mencakup `rulesetId`, `clientVersion`, `source`, `calibratedAt`, dan hash konfigurasi. Perubahan formula tidak boleh mengubah hasil pertandingan historis secara diam-diam.

Artefak yang disarankan:

- `src/domain/player-formulas.ts` untuk modul formula yang pure dan mudah diuji.
- `src/config/formula-versions.ts` untuk ruleset version dan provenance.
- `tools/calibrate-player-formulas.ts` untuk membaca observation fixtures dan menghasilkan parameter kandidat.
- `data/calibration/player-observations.jsonl` untuk data numerik yang boleh disimpan secara aman.
- `test/golden/player-formulas.test.ts` untuk golden observations, invariants, dan monotonicity.
- `docs/PLAYER_FORMULA_CALIBRATION_REPORT_<date>.md` untuk error, confidence interval, dan keputusan promosi formula.

Sebuah formula boleh dipromosikan dari `RECOVERY_INFERRED` ke `OFFICIAL_CALIBRATED` hanya bila: observasi berasal dari sumber resmi atau controlled run; input-output dapat direproduksi; residual error dan distribusi output berada dalam target yang disepakati; edge cases telah diuji; dan versioned replay historical match tetap konsisten.

## 4. Rencana perbaikan matchmaking Versus

### Sasaran perilaku

Pengguna cukup membuka **Versus Mode** atau **Versus Home**. Bot menunjukkan status `Searching`, `Matched`, atau `Ready`, lalu menampilkan opponent dan battle deadline. Tidak ada command teknis seperti `/versus-matchmake`. Private group code dapat dipertahankan hanya sebagai jalur sosial/fallback apabila memang diperlukan, bukan sebagai representasi bahwa user membuat canonical club.

### Model data yang disarankan

Untuk production PostgreSQL, tambahkan repository/tables khusus. Profile JSONB tetap dapat menjadi projection atau fallback lokal, tetapi bukan canonical source of truth untuk queue dan settlement.

| Entity | Field penting | Invariant |
|---|---|---|
| `versus_queue_ticket` | ticket ID, user ID, queue key, rating snapshot, roster version, region, queuedAt, expiresAt, status | Satu active ticket per user/queue; retry memakai idempotency key |
| `versus_match` | match ID, queue, home/away user/team, matchedAt, state, deadline, ruleset version | Match tidak dapat memiliki dua assignment aktif untuk user yang sama |
| `versus_submission` | match ID, user ID, lineup snapshot, tactic, formation, roster version, submittedAt | Snapshot immutable setelah deadline/lock |
| `versus_opponent_snapshot` | opponent ID, roster snapshot, strength inputs, provenance | Lawan yang dipakai settlement tidak berubah setelah lock |
| `versus_queue_event` | event ID, ticket ID, type, createdAt, idempotency key | Event append-only dan dapat direplay |

### Algoritme bertahap

1. Saat Versus Home dibuka tanpa assignment aktif, server membuat queue ticket dalam transaksi atomic.
2. Matchmaking worker mencari ticket pada queue dan region yang sama. Untuk user baru, gunakan provisional rating dari assigned roster/team strength; jangan menyebutnya MMR asli.
3. Mulai dari rating window sempit. Lebarkan window berdasarkan waktu menunggu. Parameter window harus configurable dan berstatus `RECOVERY_INFERRED` sampai ada bukti resmi.
4. Prioritaskan opponent manusia yang eligible. NPC/recovered opponent digunakan hanya setelah timeout atau ketika kapasitas minimum belum terpenuhi, dan ditandai sebagai `SYSTEM_FALLBACK`.
5. Setelah pasangan ditemukan, buat `versus_match` dan simpan opponent snapshot, roster version, ruleset version, dan deadline dalam transaksi yang sama.
6. Tampilkan status pada Versus Home. Tombol Lineup hanya aktif pada state `MATCHED` atau `READY`; jika ticket expired, entry Versus membuat ticket baru secara idempotent.
7. Lock submission pada deadline. Settlement mengambil snapshot immutable, menggunakan advisory lock per match/queue, dan menulis reward ledger dalam transaksi atomik.

Lifecycle yang disarankan adalah `QUEUED → MATCHED → READY → LOCKED → SETTLED`, dengan terminal states `EXPIRED`, `CANCELLED`, atau `VOIDED`. Semua transition harus memiliki actor, timestamp, expected version, dan event ID.

### Keamanan dan reliabilitas

Queue harus menolak duplicate ticket, cross-user component, stale roster version, replayed confirmation, dan perubahan opponent setelah lock. Rate limit diterapkan per user dan per queue. Postgres memakai unique constraint untuk active ticket dan advisory lock untuk match assignment; JSON fallback memakai serialized group queue. Reconnect cukup memanggil Versus Home dan membaca canonical state, bukan membuat match baru.

## 5. Rencana ekonomi Versus

### Prinsip wallet

`versusMoney` dan `versusCoin` tetap terpisah dari Player money, Coach assets, dan premium currency lain. Semua perubahan wallet wajib melewati append-only ledger dengan transaction ID, source, amount, balance before/after, ruleset version, dan idempotency key. Tidak boleh ada handler yang langsung menaikkan balance tanpa ledger event.

Untuk production, gunakan transaksi ekonomi dengan pola:

```text
validate command
→ acquire idempotency key
→ lock wallet/order
→ verify balance and state
→ reserve or debit funds
→ write domain event + ledger entries
→ update projection
→ commit
```

Jika salah satu langkah gagal, seluruh transaksi rollback. Reward settlement harus dapat dipanggil berulang kali tanpa menambah balance kedua kali.

### Deal auction

Footage menunjukkan listing player, score, age, position, bid, tombol bid, dan countdown.[4] TapTap juga membahas market pemain dan window waktu, tetapi posting tersebut adalah evidence komunitas dan berisi metode manipulasi save yang tidak boleh disalin.[6]

Implementasi aman:

| Komponen | Aturan yang harus dibuat |
|---|---|
| Listing | `listingId`, player snapshot, seller/system source, `startsAt`, `endsAt`, status, ruleset version |
| Bid | Validasi minimum increment, wallet available, idempotency key, dan user eligibility |
| Escrow | Dana bid di-reserve, bukan langsung dianggap sebagai reward atau hilang permanen |
| Outbid | Reserve lama dilepas dalam transaksi atomik dan ledger mencatat release |
| Settlement | Hanya worker/server yang boleh menentukan winner setelah countdown selesai |
| Expiry | Listing expired tidak dapat menerima bid; retry settlement bersifat idempotent |
| Snapshot | Player age, score, position, dan offer tidak berubah selama listing aktif |

Jika durasi resmi belum ditemukan, gunakan clock lease configurable untuk internal testing dan label `RECOVERY_INFERRED`; jangan mengklaim angka 59 detik sebagai aturan resmi hanya karena satu posting komunitas.

### Scout, Sponsor, dan premium economy

Changelog regional mengonfirmasi adanya advanced Scout dan player-status improvement, sedangkan footage menunjukkan Scout dan sponsor surface.[3] [4] Karena cost, offer generation, cooldown, payout, dan effect formula belum sepenuhnya diketahui, implementasikan dalam dua fase:

1. **Shadow/read-only phase:** server menghasilkan candidate offer dari ruleset version, tetapi tidak mengubah wallet atau roster. Telemetry mengukur click-through, rejection, expiry, dan expected cost.
2. **Authoritative phase:** setelah cost/effect/persistence diperoleh dari controlled observation, transaksi Scout/Sponsor memakai ledger, cooldown table, offer snapshot, and idempotency. Status boost memiliki duration, stacking rule, source event, dan rollback/expiry.

Sponsor tiers Junior/Senior/Top harus diperlakukan sebagai contract/offer, bukan tombol reward gratis. Claim hanya boleh dilakukan sekali per sponsor contract dan harus memiliki expiry serta audit event. Premium diamond spending harus dipisahkan dari coin auction dan tidak boleh digunakan untuk membypass lineup, deadline, atau settlement.

### Economy balance loop

Sebelum angka baru diterapkan, buat simulation report yang memetakan sumber dan sink:

| Source | Sink | Guard |
|---|---|---|
| Battle win/draw/loss reward | Deal bid, Scout, Sponsor, recovery | Reward ledger idempotent |
| Season reward | Market/roster improvement | Season state `FINISHED` only |
| Coin purchase/earned coin | Auction bid | Escrow and outbid release |
| Sponsor payout | Sponsor fee/contract | Contract expiry and one-time claim |
| Premium currency | Optional status/shop actions | Separate wallet and explicit purchase provenance |

Target ekonomi bukan sekadar membuat balance terlihat mirip. Kita perlu mengukur median time-to-afford, inflation per season, sink/source ratio, abandoned auctions, failed bids, and reward duplication. Semua metrik harus dihitung per `rulesetVersion` agar perubahan balance dapat dibandingkan.

## 6. Roadmap delivery

| Fase | Deliverable | Exit criteria |
|---|---|---|
| 0. Evidence capture | Observation schema, source labels, controlled-run checklist, no-proprietary-asset policy | Semua angka baru memiliki provenance dan repeatability status |
| 1. Player formula harness | Pure formula modules, calibration CLI, observation fixtures | Golden tests dan deterministic replay tersedia |
| 2. Player calibration | Rating, goal, training, injury, reward, career calibration per position | Residual/distribution report disetujui sebelum ruleset promotion |
| 3. Versus canonical queue | PostgreSQL queue/match/submission tables, worker, state machine, auto-entry from Versus Home | Duplicate, stale, timeout, reconnect, and concurrent assignment tests pass |
| 4. Versus economy core | Wallet ledger, auction escrow, bid expiry, idempotent settlement | No negative balance, no double reward, replay-safe transactions |
| 5. Scout/Sponsor | Shadow mode first, then authoritative offers/contracts | Cost, cooldown, effect, expiry, and audit behavior observed and tested |
| 6. Rollout | Feature flags, migration, telemetry, backfill, rollback plan | Old JSON projection remains readable; new canonical state can be rebuilt |

## 7. Acceptance criteria

### Player Mode

Player formula work dianggap berhasil bila setiap formula surface memiliki version dan provenance; controlled observations dapat direplay; rating/skill relationships memenuhi monotonicity yang disepakati; W/D/L dan gol mengikuti distribusi baseline; energy, HP, injury, EXP, reward, retirement, dan rebirth tidak melanggar invariant; serta historical records tetap memakai ruleset lama.

### Versus matchmaking

Matchmaking dianggap berhasil bila membuka Versus tanpa assignment membuat satu ticket idempotent, ticket dipasangkan tanpa duplicate opponent, rating window melebar secara bertahap, timeout memiliki fallback yang transparan, roster/deadline snapshot immutable, reconnect tidak menggandakan match, dan dua worker concurrent tidak membuat dua assignment.

### Versus economy

Ekonomi dianggap berhasil bila setiap debit/kredit memiliki ledger event, bid memakai escrow, outbid mengembalikan reserve secara atomic, listing tidak dapat disettle dua kali, Scout/Sponsor tidak memberikan reward tanpa contract state, wallet tidak negatif, dan audit dapat merekonstruksi balance dari event.

## 8. Risiko dan batas parity

Risiko terbesar adalah mengira UI sebagai formula. Public footage dapat membuktikan bahwa screen atau button ada, tetapi tidak otomatis membuktikan algoritme, cost, cooldown, atau server behavior. Risiko kedua adalah menjadikan NPC fallback sebagai fake matchmaking yang tampak online tetapi tidak memiliki queue semantics. Risiko ketiga adalah mengimplementasikan ekonomi dari posting komunitas yang mungkin menjelaskan exploit, bukan desain resmi.

Karena itu, target realistis adalah **high-fidelity gameplay reconstruction dengan formula yang semakin terkalibrasi**, bukan klaim parity 1:1 tanpa controlled observations. Jika data asli tidak dapat diperoleh, DISCORDFC harus tetap menggunakan inferred ruleset yang transparan, versioned, deterministic, dan dapat diganti tanpa merusak historical state.

## References

[1]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play listing"

[2]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store listing"

[3]: https://apps.apple.com/mo/app/%E8%B6%B3%E7%90%83-%E5%B7%A8%E6%98%9F%E5%B4%9B%E8%B5%B7/id1585604439 "Football Rising Star — regional Mandarin App Store listing"

[4]: https://www.youtube.com/watch?v=V8MsDUXNl8A "Footy Star Versus Mode — No Commentary — Day1"

[5]: https://www.youtube.com/watch?v=KQiUcv9d25c "Football Rising Star review — Android game, 2021"

[6]: https://www.taptap.cn/moment/362746078098883195?group_id=306994 "TapTap community battle-mode market post"
