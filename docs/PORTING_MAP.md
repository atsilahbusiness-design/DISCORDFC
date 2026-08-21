# Pemetaan Porting Football Rising Star ke Discord

Dokumen ini memisahkan fakta yang terlihat dari dump struktur dengan keputusan implementasi MVP. Body method pada dump IL2CPP adalah stub, sehingga keputusan formula yang belum tervalidasi ditandai sebagai **implementasi sementara**.

| Sumber recovery | Informasi yang terlihat | Implementasi bot |
| --- | --- | --- |
| `CoachPlayerManager` | Dictionary pemain, daftar pemain, mapping pemain-ke-klub, load/save, event pindah klub | `PlayerStore` dan `PlayerProfile.userId/club` |
| `CoachNPCPlayer` | Club, status, HP, cedera, skor ability per posisi, total ability, season average, market price | `PlayerProfile.hp`, `stats`, `career`, `lastMatch`; market ditunda |
| `CoachUserModel` | Money, HP, salary, EXP assignment, buff, retirement, reincarnation | `money`, `hp`, `totalExp`; salary/retirement/reincarnation ditunda |
| `CoachUserAbility` | Ability ID, level, EXP, threshold level, nama multibahasa | `abilities`, `stats`, dan `/train` |
| `CoachTimeManager` | Pergantian hari/minggu, next battle, season, Champions League, market window, event, retirement | Timestamp recovery saat command; scheduler/event belum diaktifkan |
| `GameData` | Appearances, substitute, MVP, goal, assist, red/yellow card, steals, injury, clean sheet, block, hat-trick | Sebagian career stats di MVP; field lanjutan ditunda |
| `BattlePlayer` | Atk/def, waktu bermain, goal, assist, card, hurt, steal, block, score, MVP, captain, goal times | `MatchRecord` dan stat update sederhana |
| `CoachBattleClub` | Ball control, shots, shot-on-target, corner, tactics, formation, coach score, extra time | Rating dan goal simulation; tactics/formations belum configurable |
| `BattleGoal` | First half, second half, extra time, shootout | Match record menyimpan skor total; detail babak ditunda |
| `GoalHelp` | API kalkulasi gol dan adu penalti | Formula sementara deterministic-seeded karena body method tidak tersedia |
| `FormationConfig` / `PositionConfig` | Komposisi formasi, bobot posisi, HP consume, goal/assist/injury/card ratios | Position-aware initial stats; formation engine ditunda |
| `LeagueConfig` / `CoachLeague` / `CoachSeason` | Liga, ronde, bonus kandang, prestige, season, standings | Personal season/points/matchday untuk MVP |
| `GameEventUserChooseConfig` | Cost, reward, desc, message, pilihan event | Event interaktif ditunda |

## Kontrak formula sementara

Rating pemain menggunakan kombinasi bobot posisi dan rata-rata atribut. Simulator menciptakan lawan dari matchday dan seeded random source, lalu menjalankan lima peluang serangan per tim. Biaya pertandingan adalah 20 energi dan 8 HP. Reward MVP adalah 220 money/42 EXP untuk kemenangan, 140 money/30 EXP untuk seri, dan 90 money/22 EXP untuk kekalahan.

Nilai tersebut **bukan klaim bahwa formula identik dengan game asli**. Nilai sengaja diletakkan pada engine domain agar dapat diganti ketika tim memiliki source C# atau hasil pengukuran backend yang berwenang.

## Batasan recovery

Arsip tidak memuat source C# identik, scene/prefab Unity, konfigurasi import/editor, secret backend, atau data server. Reverse engineering body method dari `libil2cpp.so` dapat memberikan informasi tambahan, tetapi tetap perlu validasi hukum, otorisasi internal, dan pengujian kompatibilitas. Bot ini menggunakan nama domain dan struktur gameplay sebagai referensi internal, bukan menyalin binary game.

## Status expanded implementation

Sejak MVP, domain bot telah diperluas menjadi dua loop: career player dan club management. Roster, formation, tactics, assets, prestige, fixture, standings, league tier, promosi/degradasi, season reset, market, contract, daily reward, event choice, Champions League knockout, achievement, maintenance scheduler, structured logging, rate limiting, dan admin operations kini tersedia pada codebase.

| Area recovery | Status bot | Catatan parity |
| --- | --- | --- |
| `CoachLeagueManager` dan `CoachSeason` | Implemented rebuild | Fixture, standings, season, tier, promotion, Champions League state; jadwal dan ranking dibuat modular |
| `CoachClub` | Implemented rebuild | Roster, formation, tactic, assets, prestige, buy/sell player |
| `Contract` | Implemented rebuild | Salary, begin/end time, active/expired, renewal |
| `GameEventUserChooseConfig` | Implemented rebuild | Daily choice event dengan cost/reward/morale contract |
| `CoachChampionsLeague` | Implemented rebuild | Qualification gate, round, opponent, aggregate, eliminated/champion |
| `Achievement/Honor` | Partial implemented | Achievement progress dan claim; honor reward layer masih dapat diperdalam |
| `GameData` battle statistics | Partial implemented | Core appearances/wins/draws/losses/goals; assists/cards/steals/clean sheets masih perlu golden data |
| Formula `GoalHelp` dan tactics | Modular inferred | Balance dipusatkan pada `src/config/game-balance.ts`; source saat ini `RECOVERY_INFERRED` |
| Official player/club/config data | Seed data only | Ganti `src/config/seed-data.ts` dengan data internal resmi yang berwenang |

Parity 1:1 belum dapat dipastikan karena dump recovery tidak memberikan source C# dan backend live. Setiap angka yang inferred harus dikalibrasi dengan data resmi sebelum public launch.
