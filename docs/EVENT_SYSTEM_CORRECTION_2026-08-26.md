# Event System Correction — Football Rising Star vs DISCORDFC

**Tanggal:** 26 Agustus 2026  
**Kesimpulan utama:** Implementasi bot saat ini memang salah mengabstraksikan event. `PlayerProfile.event` yang dibuat setiap hari dan dibuka melalui command `event` bukan padanan aman dari gameplay asli. Pada build yang terlihat, Player event tampak sebagai **kejadian berkala yang muncul di dalam career/weekly loop**, sedangkan Coach memiliki **decision-event layer yang nyata dan berulang di antara management rounds, match, dan season management**.

## 1. Jawaban langsung atas kebingungan command

Command `event` muncul dua kali karena adapter Discord memetakan dua aggregate internal yang berbeda ke nama subcommand yang sama: `player.career.event → event` dan `coach.event → coach-event`. Itu membuat seolah-olah game asli memiliki menu event yang simetris pada kedua mode. **Itu kesalahan UX dan kesalahan model mental dari pihak bot.**

Pada game asli, bukti yang tersedia tidak menunjukkan pengguna membuka sebuah “Daily Event” Player setiap hari sebagai aktivitas utama. Sebaliknya, listing resmi menggambarkan Player sebagai karier 20 tahun berisi kompetisi, training, dan transfer; walkthrough Player memperlihatkan weekly update, match, EXP allocation, league table, culture study, holiday/winter-break content, windfall fans, dan King of Soccer event; review pengguna menyebut “you may get lucky with an event” dalam loop tap tiga tombol mingguan.[1] [2] [3] [4] Dengan demikian, Player event lebih tepat dimodelkan sebagai **occasional career incident / activity result yang dipicu oleh timeline**, bukan sebagai command harian yang selalu menghasilkan pilihan acak.

Sebaliknya, Coach walkthrough secara langsung memperlihatkan pilihan-pilihan event yang harus dipilih oleh Coach: Team-Building (`Go Fishing`, `Island Tour`, `Tea Time`), Press & Media (`The Leak of Tactics`, `TV Show`), Locker Room Speech, Clique, Locker Room Crisis, Youth Training, Youth System Star, Budget, Team Doctors, dan failure-to-reach-seasonal-goal. Event-event ini muncul di antara management actions, match simulations, board targets, transfer operations, dan season settlement.[5] [6] Ini bukan asumsi generik dari game manager lain; timestamp-nya berasal dari gameplay Football Rising Star yang dianalisis.

> **Koreksi inti:** Player tidak boleh dipresentasikan sebagai “mode dengan Daily Event command”. Coach memang memiliki event decision layer yang terintegrasi ke siklus manajemen. Kedua hal tersebut bukan pasangan command yang setara.

## 2. Evidence matrix

| Pertanyaan | Evidence langsung/official | Kesimpulan yang boleh dibuat | Yang belum boleh diklaim |
|---|---|---|---|
| Apakah Player memiliki event? | Walkthrough Player memperlihatkan Culture Study, windfall +100 Fans, winter break, King of Soccer +100 EXP, dan annual award; Google Play review menyebut pemain bisa “get lucky with an event”.[3] [4] | Player memiliki kejadian/aktivitas karier yang muncul dalam timeline, termasuk event musiman/holiday dan incident yang dapat memberi reward atau perubahan state. | Tidak terbukti bahwa ada satu event baru setiap hari, satu menu command khusus, atau lima template random seperti di repository. |
| Apakah Player event merupakan aksi utama mingguan? | Direct walkthrough memperlihatkan urutan weekly update/training result → match → EXP allocation → league table; event muncul sebagai bagian lain dari career timeline.[3] | Event harus menjadi optional/conditional branch pada weekly/season timeline, bukan pengganti weekly loop dan bukan entry point rutin. | Tidak terbukti trigger probability, cooldown, event pool, atau reward formula. |
| Apakah Coach memiliki event pilihan? | Coach season walkthrough memberi timestamp berulang untuk Team-Building, Press/Media, Locker Room, Clique/Crisis, Youth, Budget, Doctors, dan target failure.[5] [6] | Coach memiliki decision event layer yang benar-benar merupakan bagian dari management gameplay dan dapat menunggu pilihan sebelum alur lanjut. | Tidak terbukti bahwa lima template repository, nama internal, reward, atau event chance sekarang sama dengan build produksi. |
| Apakah Coach event terpisah dari board target? | Video memperlihatkan board target pada awal/season dan event choices pada banyak timestamp lain.[5] [6] | Board meeting/season target dan random/triggered management incidents adalah dua state berbeda, meskipun keduanya memengaruhi Coach progression. | Tidak boleh menyatukan board target, event, job offer, dan match result menjadi satu generic event object. |
| Apakah job offer adalah event? | Coach video memperlihatkan job offers sebagai screen/decision tersendiri pada awal dan setelah season.[5] [6] | Job offer adalah career transition/contract state, bukan random event biasa. | Tidak boleh dimasukkan ke pool `CoachEvent` sebagai satu choice tanpa contract/club transition. |
| Apakah Player culture/trick/holiday content adalah daily event? | Walkthrough Player menunjukkan Culture Study, Trick Training, winter break, World Footballer, King of Soccer, and windfall at distinct points.[3] | Ini adalah subsystems berbeda: training/activity, skill progression, seasonal break/award, and incident/reward. | Tidak boleh digabungkan ke satu `EventState` dengan pilihan cost/reward generik. |

## 3. Repository audit

### Player path saat ini

`src/domain/progression-engine.ts` memiliki `EVENT_TEMPLATES` berisi `academy-visitor`, `sponsor-call`, `locker-room`, `media-interview`, dan `teammate-meal`. `generateDailyEvent()` membuat satu event jika `profile.event.dayKey` belum sama dengan hari ini. `resolveDailyEvent()` mengizinkan pilihan setiap hari dan memproses cost, money reward, EXP, skill effects, energy, charm, dan morale. Adapter command mendaftarkan `player.career.event`, sedangkan handler menampilkan event harian dan menerima `choice`.

Pola tersebut adalah **game design baru/inferred**, bukan hasil recovery yang cukup. Nama-namanya terdengar masuk akal tetapi tidak cocok dengan evidence langsung yang terlihat. Ia juga bertentangan dengan indikasi review bahwa event adalah sesuatu yang mungkin didapat secara kebetulan dalam weekly loop, bukan tombol daily yang selalu tersedia.[4]

### Coach path saat ini

`src/domain/coach-career-engine.ts` memiliki `CoachEvent` dengan lima template: `press-criticism`, `locker-room-speech`, `team-building`, `player-discipline`, dan `financial-crisis`. `makeCoachEvent()` dipanggil setelah `advanceCoachRound()` berdasarkan `GAME_BALANCE.coach.eventChance`. Jika event belum diselesaikan, round berikutnya ditolak. Ini menangkap sebagian pola yang benar—Coach event dapat menunggu keputusan sebelum round lanjut—tetapi event catalog dan placement masih terlalu generik.

Evidence Coach menunjukkan family yang lebih luas dan lebih spesifik: press/media leak dan TV show, team-building activities, locker-room speech/crisis/clique, youth training/youth system, budget, team doctors, and seasonal-goal failure.[5] [6] Karena itu, model Coach seharusnya memisahkan **event family**, **trigger point**, **choice effect**, dan **blocking status**, bukan sekadar lima random templates setelah match.

### Adapter command saat ini

Registry sekarang memetakan:

| Registry path | Internal handler | Masalah |
|---|---|---|
| `/player career event` | `event` | Mengiklankan Daily Event sebagai aktivitas Player yang rutin, padahal evidence hanya mendukung conditional career incidents/activities. |
| `/coach event` | `coach-event` | Nama generic masih dapat diterima sebagai fallback teknis, tetapi tidak menjelaskan bahwa ini adalah management decision event dan tidak memisahkan board/job/market states. |

Secara UX, `/player career event` sebaiknya tidak menjadi aksi utama yang terlihat di Game Home. Player Game Home seharusnya memperlihatkan **weekly update, match, pending EXP, training, personal/career, club, and honors**. Jika incident sedang aktif, ia tampil sebagai card/modal di timeline dengan label yang sesuai, misalnya `Career Incident`, `Culture Study`, `Winter Break`, atau `Award`, bukan generic `Event`.

Coach Game Home seharusnya menampilkan **Board, Job/Contract, Squad/Market, Formation/Tactic, Match Round, and Pending Decision**. `Pending Decision` boleh memakai component selector, tetapi card harus menyebut family sebenarnya: `Locker Room Crisis`, `Budget`, `Team Doctors`, `Youth System`, atau `Press & Media`.

## 4. Correct state machines

### Player

```text
PLAYER_HOME
  → WEEKLY_UPDATE
  → TRAINING_RESULT / RECOVERY_RESULT
  → MATCH_READY
  → MATCH_RESULT
  → EXP_ALLOCATION_PENDING
  → LEAGUE_TABLE / PLAYER_HOME

At conditional timeline points:
  PLAYER_HOME or WEEKLY_UPDATE
  → CAREER_INCIDENT_PENDING
  → incident choice/result
  → return to timeline

At calendar milestones:
  WEEKLY_LOOP → WINTER_BREAK / AWARD / HOLIDAY_CONTENT → next season/week
```

The important property is that `CAREER_INCIDENT_PENDING` is **conditional**, not a daily guaranteed state. Culture Study and Trick Training are separate actions/subsystems. A transfer offer is a contract state. Winter Break and awards are calendar states.

### Coach

```text
COACH_HOME
  → BOARD_TARGET / JOB_OFFER / MARKET / SQUAD / FORMATION_TACTIC
  → PRE_MATCH
  → MATCH_SIMULATION
  → HALFTIME_DECISION
  → FULLTIME_RESULT
  → ROUND_SETTLEMENT
  → (optional) COACH_DECISION_PENDING
  → decision result
  → next round or season settlement

At season boundary:
  SEASON_SUMMARY
  → PROMOTION / RELEGATION / BOARD_TARGET_RESULT / AWARDS
  → JOB_OFFER or next-season club state
```

Coach decisions are not equivalent to Player daily events. They are management interventions tied to squad, media, youth, budget, medical, locker-room, or seasonal board context. A pending decision can block the next round, as the current repository already partially does, but the event should not be generated solely as an arbitrary after-match reward roll without trigger family and context.

## 5. Decisions before code changes

The evidence supports the following safe conclusions. First, remove the assumption that Player always has a daily random event. Second, hide `Player Event` from the primary menu and expose conditional incident cards only when the timeline actually creates one. Third, retain a Coach pending-decision flow, but rename and classify it according to the visible family. Fourth, keep board meeting, job offer, transfer market, training, match, award, and incident as separate state types. Fifth, do not copy video-ad monetization into the bot; the presence of ads/resource gates is evidence of the original product loop, not a requirement to reproduce monetization.

The following remain unverified and should not be hard-coded: exact event probability, trigger schedule, event rewards, energy/money costs, whether event families vary by season/club, whether a specific event is mandatory or optional, and the exact effect of Coach decisions on approval, morale, assets, or ability EXP.

## References

[1]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Official Google Play listing"

[2]: https://apps.apple.com/gb/app/football-rising-star/id1585604439 "Football Rising Star — Official Apple App Store listing"

[3]: https://www.youtube.com/watch?v=sS5T8E43LQI "Football Rising Star — Player walkthrough"

[4]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US#reviews "Football Rising Star — Google Play user reviews"

[5]: https://www.youtube.com/watch?v=hclwbUmsET4 "Football Rising Star Coach career, season 1"

[6]: https://www.youtube.com/watch?v=S7PZxhfE5pA "Football Rising Star Coach career, season 2"

## 6. Implemented correction — 2026-08-26

Koreksi ini sekarang diterapkan di source. Player Daily Event tidak lagi dibuat saat onboarding atau maintenance, `EventState`/`EventChoice` tidak lagi menjadi contract aktif pada `PlayerProfile`, dan `/player career event` sudah dikeluarkan dari registry publik. Data JSON lama dengan key `event` tidak diproses oleh lifecycle Player; alias stale diarahkan ke response deprecation agar tidak ada cost atau reward lama yang dieksekusi.

Daily reward tetap dipertahankan sebagai sistem claim/streak yang berdiri sendiri. Player Home tetap berfokus pada weekly update, match, pending EXP, training, career, club, dan honors.

CoachEvent sekarang membawa metadata optional `family`, `trigger`, dan `blocking`. Event engine yang masih ada diklasifikasikan sebagai `PRESS_MEDIA`, `LOCKER_ROOM`, `TEAM_BUILDING`, atau `FINANCE`, dipicu pada `ROUND_SETTLEMENT`, dan blocking secara default. Family yang memang terlihat di walkthrough tetapi belum dibuat sebagai template (`YOUTH_SYSTEM`, `MEDICAL`, TV Show, Budget, Team Doctors, dan variasi lain) sengaja tidak ditambahkan tanpa data choice/effect yang cukup.

Perubahan ini adalah **removal of unsupported behavior plus structural classification**, bukan klaim bahwa event catalog atau formula Coach sudah identik. Build dan 74 tests telah pass pada tahap perubahan; stress simulation, dependency audit, diff check, commit, dan push masih menjadi langkah verifikasi akhir.
