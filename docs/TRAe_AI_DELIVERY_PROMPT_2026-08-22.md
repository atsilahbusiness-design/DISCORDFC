# Trae A.I. Delivery Prompt — DISCORDFC Gameplay Parity

## Konteks

Lanjutkan repository `atsilahbusiness-design/DISCORDFC` sebagai bot Discord game Football Rising Star yang memiliki tiga mode terpisah: Player Mode, Coach Mode, dan Versus Mode. Jangan mengklaim parity 1:1 dengan game asli; body method server resmi Babuyo Games tidak tersedia. Semua koefisien hasil rekonstruksi harus tetap diberi label `RECOVERY_INFERRED`.

## Perubahan yang sudah diselesaikan

Coach Mode kini memiliki `coach-career-engine.ts` dengan enam abilities (`formation`, `tactics`, `stateAdjustment`, `trainingLevel`, `lockerRoom`, `charisma`), career start, round simulation dua babak, manual Coach EXP, approval, board target, promotion/relegation threshold, job offer, accept/decline, lima event Coach, retirement, dan rebirth. Coach memakai `coachClubState` yang terpisah dari `clubState` milik Player; season counter, fixtures, formation, tactic, roster, assets, reward, dan board evaluation Coach tidak memajukan atau menimpa league Player.

Discord command surface Coach tersedia melalui `/coach-career`, `/coach-profile`, `/coach-round`, `/coach-exp`, `/coach-event`, `/coach-job`, `/coach-retire`, dan `/coach-rebirth`. `/formation` dan `/tactic` menerima opsi `mode:PLAYER|COACH`, sedangkan `/help` menjelaskan tiga mode.

Versus Mode kini memiliki aggregate type dan `versus-engine.ts` terpisah, termasuk `VersusUserStatus`, `VersusClub`, `VersusPlayer`, `VersusSeason`, `VersusBattle`, submission snapshot, eligibility validation, seeded two-half simulation, ball-control/shots/corners/cards/MVP, HP/injury/card updates, standings, home-away round-robin dengan beberapa club per round, season rewards, promotion/relegation flags, group-code enrollment, dan idempotent reward history. Versus memakai wallet dan roster sendiri; ia tidak membaca `clubState` atau `coachClubState` untuk settlement.

Command Versus tersedia melalui `/versus-join`, `/versus-profile`, `/versus-standings`, `/versus-round`, dan `/versus-season`. Settlement handler menggunakan group-level queue dalam satu bot instance dan menyimpan season snapshot pada seluruh profile anggota group. `simulationSeed`, `rulesetVersion`, dan settlement payload disimpan untuk audit/replay.

Dashboard buttons Player/Coach/Versus sekarang owner-bound. Formation/tactic, Player club match, Coach round, dan Versus round memakai state field masing-masing. Balance config menampung knob Player, Coach, dan Versus dalam `src/config/game-balance.ts`; snapshot tercatat pada `docs/BALANCE_SNAPSHOT_2026-08-22.json`.

## Validasi yang sudah dilakukan

Jalankan:

```bash
pnpm build
pnpm test
```

Hasil terakhir: **36 test passing, 0 failing**. Test baru mencakup Coach career/job/retirement/rebirth, Versus multi-club home-away settlement, two-half stats, deterministic seed payload, standings, reward idempotency, dashboard ownership, dan isolasi Player/Coach/Versus.

## Batas yang masih harus dipertahankan

Exact formula server asli, exact Coach board threshold, exact Versus group capacity, exact reward economics, dan real-time PvP transport belum dapat diverifikasi dari recovery signature maupun referensi publik. Implementasi saat ini memilih asynchronous server-style Versus yang paling cocok dengan evidence `ProcessSeasonMatch`, time-driven lifecycle, group/season/league schema, dan `FirstHalf`/`SecondHalf`. Jangan menambahkan klaim bahwa bot ini identik dengan client/server resmi tanpa data perusahaan.

Persistence Versus saat ini menggunakan snapshot season pada profile user dan group-level queue pada satu proses bot. Jika deployment multi-instance atau atomic cross-user transaction benar-benar diperlukan, tahap lanjutan perlu membuat repository/SQL aggregate khusus untuk `versus_groups`, `versus_seasons`, `versus_clubs`, `versus_battles`, `versus_submissions`, `versus_settlements`, dan ledger idempotency, lalu menguji concurrency PostgreSQL lintas instance. Fitur real-time lobby/PvP sebaiknya tetap ditunda sampai protocol resmi dikonfirmasi.

Jangan memasukkan token Discord, credential database, secret, file binary game, atau client archive proprietary ke repository. Pertahankan `git diff --check`, build, dan seluruh test sebelum perubahan berikutnya.
