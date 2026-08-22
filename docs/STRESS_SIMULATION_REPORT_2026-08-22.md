# Laporan Stress Simulation DISCORDFC

Tanggal eksekusi: `2026-08-22T03:56:41.684Z`.

> **Kesimpulan:** Setelah tiga perbaikan domain dan satu koreksi harness yang ditemukan melalui stress testing, ketiga mode menyelesaikan 300 trial masing-masing tanpa exception, tanpa invariant failure, dan tanpa perbedaan hasil pada deterministic replay.

## Konfigurasi

| Parameter | Nilai |
|---|---:|
| Trial per mode | 300 |
| Player week per trial | 60 |
| Coach season per trial | 2 |
| Versus capacity | 8 club |
| Total domain actions | 114,570 |

## Ringkasan reliability

| Mode | Trial sukses | Trial gagal | Invariant checks | Invariant failures | Determinism checks | Determinism failures |
|---|---:|---:|---:|---:|---:|---:|
| PLAYER | 300/300 (100.00% ) | 0 | 18,300 | 0 | 25 | 0 |
| COACH | 300/300 (100.00% ) | 0 | 23,400 | 0 | 25 | 0 |
| VERSUS | 300/300 (100.00% ) | 0 | 8,400 | 0 | 25 | 0 |

## Player Mode

Player menjalankan 18,000 week dan 17,358 match. Distribusi hasil adalah 5,793 win (33.37% ), 6,998 draw (40.32% ), dan 4,567 loss (26.31% ). Stress loop juga memproses 16,706 detailed training orders, 1,200 culture studies, 1,373 injury, dan 1,800 annual award resolution.

| Metric | Nilai | Rate/interpretasi |
|---|---:|---|
| Match | 17,358 | 57.86 per trial |
| Win | 5,793 | 33.37%  dari match |
| Draw | 6,998 | 40.32%  dari match |
| Loss | 4,567 | 26.31%  dari match |
| Injury | 1,373 | 7.91%  per match |
| Training order | 16,706 | progression settlement berhasil |

Invariant Player yang diuji mencakup HP/energy dalam batas, money non-negatif, pending EXP non-negatif, detailed-skill level/EXP valid, career status valid, dan mode tetap `PLAYER`.

## Coach Mode

Coach menyelesaikan 600 season, 22,800 round, dan memverifikasi halftime pada seluruh 22,800 match. Distribusi hasil round adalah 5,616 win (24.63% ), 7,057 draw (30.95% ), dan 10,127 loss (44.42% ). Sebanyak 13,066 Coach event diselesaikan dan 600 board settlement menghasilkan honor pada konfigurasi trial ini.

| Metric | Nilai | Rate/interpretasi |
|---|---:|---|
| Season | 600 | 2.00 per trial |
| Round | 22,800 | 76.00 per trial |
| Halftime checks | 22,800 | 100.00%  round memiliki halftime |
| Coach event | 13,066 | event dapat diselesaikan tanpa deadlock |
| Board success | 600 | 100.00%  season |

Invariant Coach mencakup enam abilities valid, approval 0–100, Coach Club roster depth legal, fixture season home-away, dan Player club/league state tidak berubah selama Coach round, season settlement, dan rebirth/job lifecycle yang dijalankan harness.

## Versus Mode

Versus menyelesaikan 4,200 round dan 16,800 battle pada liga 8 club. Semua battle menjadi `PUBLISHED`, semua settlement memiliki halftime stats, dan 2,400 reward season tersedia setelah settlement.

| Metric | Nilai | Rate/interpretasi |
|---|---:|---|
| Round | 4,200 | 14.00 per trial |
| Battle | 16,800 | 56.00 per trial |
| Published battle | 16,800 | 100.00%  |
| Halftime checks | 16,800 | 100.00%  |
| Standings checks | 4,200 | setiap round |
| Season rewards | 2,400 | 8.00 per trial |

Invariant Versus mencakup 8 club, 56 battle home-away per season, lineup legality, roster HP/card bounds, standings rank unik, reward isolation dari Player money, idempotent history, dan mode state Player/Coach yang tetap sama setelah sync.

## Defect yang ditemukan dan diperbaiki

Stress run awal menemukan tiga isu penting. Pertama, Coach Club kehilangan pemain sehat setelah banyak fixture karena HP ClubPlayer tidak dipulihkan antar-round. Kedua, beberapa recovered opponent roster tidak memiliki distribusi posisi legal untuk formasi recovered; roster-depth normalizer menambahkan fallback players pada posisi yang kurang tanpa menghapus recovered records. Ketiga, Coach match memutasi Player league, HP, dan career statistics karena `playClubMatch` memakai profile-level fields tanpa memeriksa `stateField`; update tersebut sekarang dibatasi untuk Player Club.

Versus pada stress run awal juga memiliki false positive dari harness karena profile belum di-enroll ke group sebelum `syncVersusProfileWithSeason`. Harness diperbaiki untuk menjalankan lifecycle `/versus-join` terlebih dahulu. Setelah itu, recovery roster dan card/injury cadence diperbaiki di domain agar season home-away tidak deadlock.

## Batas interpretasi

Hasil ini membuktikan stabilitas internal dan determinism dari ruleset reconstructed saat ini, bukan parity 1:1 dengan server resmi Football Rising Star. Exact server coefficients, authoritative matchmaking, dan real-time transport tetap tidak terverifikasi. Nilai yang direkonstruksi harus tetap dianggap `RECOVERY_INFERRED`.

Raw result: `docs/STRESS_SIMULATION_RESULTS_2026-08-22.json`. Harness: `tools/stress-simulation.ts`.
