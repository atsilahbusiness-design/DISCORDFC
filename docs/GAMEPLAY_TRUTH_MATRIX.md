# Gameplay Truth Matrix — Football Rising Star

**Tanggal:** 2026-08-22  
**Purpose:** Menggabungkan 20 analysis runs Player Mode, enam analisis Coach/overview, sumber publik, dan recovery dump menjadi kontrak bukti untuk DISCORDFC.

## Evidence levels

| Level | Meaning |
|---|---|
| `VIDEO_OBSERVED` | Terlihat langsung pada video gameplay yang dianalisis. |
| `PUBLIC_OFFICIAL` | Disebut pada halaman resmi App Store/Google Play atau release note store. |
| `PUBLIC_COMMUNITY` | Dilaporkan NamuWiki atau sumber komunitas; berguna sebagai corroboration, bukan formula resmi. |
| `RECOVERY_SCHEMA` | Field/class/method signature tersedia pada IL2CPP recovery dump; membuktikan struktur, bukan body formula. |
| `RECOVERY_INFERRED` | Rekonstruksi perilaku atau angka yang belum dibuktikan oleh body method/server. |
| `DISCORD_ADAPTATION` | Keputusan desain khusus bot Discord untuk memenuhi multiplayer/UX tanpa mengklaim berasal dari game asli. |

## Mode matrix

| Area | Player Mode | Coach Mode | Versus Mode | Evidence and implementation consequence |
|---|---|---|---|---|
| Mode identity | Solo athlete career. | Solo retired-star coach/club career. | Separate online/group battle mode. | Player/Coach are repeatedly video-observed; Versus is supported by user clarification, NamuWiki battle-mode wording, App Store release-note index, and dedicated recovery classes. |
| Unlock | Starts as a player career around age 15. | Starts as retired star coach; public community reports battle unlock after one completed Coach season. | Group/battle mode. | Versus unlock condition is `PUBLIC_COMMUNITY`; exact production gate should be configurable. |
| Primary time unit | Week → simulated fixture/event/training. | Week and round → simulated fixture and club management. | Scheduled time/round and system-time processing. | `VIDEO_OBSERVED` for Player/Coach; `RECOVERY_SCHEMA` for Versus `Time`, `ProcessSeasonMatch`, `OnTimeChanged`. |
| Match control | No direct pitch control; simulated result. | No direct pitch control; formation/tactic/halftime adjustments. | Online battle settlement; two-half battle schema. | Keep simulation deterministic and expose decision inputs, not manual action controls. |
| User scope | One player profile. | One coach and managed club. | One user-owned Versus club inside a group/league. | Separate aggregates and wallets. |
| Skills | 12 detailed player skills plus macro summaries. | Six coach abilities: FU, TT, SA, TL, LP, PC. | Club/player condition and tactical/formation effects. | Store detailed Player and Coach skills separately; do not flatten into one generic stat model. |
| Training | Regular, trick, personal trainers. | Coach attribute EXP, staff/TA, team-building and training effects. | Scouting, player condition, roster and tactical preparation. | Separate commands and catalogs; shared utility only for validation/ledger. |
| Formation/tactics | Mostly player role/position context. | Core preparation and halftime adjustments. | Battle club has tactic/formation add-ratio hooks. | Coach and Versus require snapshots of formation/tactics at fixture lock. |
| Match data | Score, rating, goals/assists/tackles/cards/injury. | Score, player ratings, possession, shots, on-target, corners, cards. | Score, goals, ball control, shots, corners, cards, award, result state, MVP. | Implement mode-specific result schemas; common audit envelope may be shared. |
| EXP | Manual post-match assignment to 12 skills. | Manual post-match assignment to six coach abilities. | Rewards/coins and seasonal score rather than Player EXP. | Use separate EXP ledgers and settlement transactions. |
| Injury/condition | Energy, injury treatment, suspension. | Player injuries/cards and coach energy/morale. | Player condition processing in scheduled Versus procedure. | Condition is part of fixture eligibility and must be processed idempotently. |
| Economy | Money/salary, diamonds/medals, treatment/training. | Assets/coins/diamonds, transfer budget, salary. | Versus money/coin, scout resources, sponsor/exchange counters. | Separate wallets; no cross-mode duplication. |
| Events | Culture, social, media, club, practice, financial events. | Rumors, morale, discipline, board, media, financial crisis. | No video evidence; recovery/public metadata indicates group/scout/condition systems. | Separate event catalogs; Versus events can be added only after product rules are confirmed. |
| Transfers | Contract offers, pay request, transfer, negotiation. | List/Scout/Deal market, buying/selling, job offers. | Scout arrays and separate player/club data. | Coach transfer roster should not mutate a locked Versus battle snapshot. |
| Competition | Domestic league, Q/Champions League, national team, awards. | Domestic league, QCL, board targets, promotion/relegation, awards. | Group league/season, rounds, standings, rewards, score/diff-goal. | Use three competition contexts with shared standings primitives. |
| Career end | Retirement around 34; rebirth with inherited benefits. | Dismissal, job change, retirement, rebirth. | Season over/league movement; no human career retirement observed. | Separate lifecycle state machines. |
| Online evidence | None visible in 20 Player runs. | None visible in six Coach/overview runs. | Strong schema/public evidence, but real-time transport unverified. | Build asynchronous/server-synchronized first; label real-time PvP as unverified. |

## System truth matrix

| Gameplay claim | Player evidence | Coach evidence | Versus evidence | Status |
|---|---|---|---|---|
| `Next Week` is the main Player time advance | 20-run repeated observation. | Coach videos also show week/round advance. | `OnTimeChanged`, `LastSysTime`, `ProcessSeasonMatch`. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Matches are simulated | Repeated result screens; no pitch control. | Repeated top-down simulation and halftime choices. | `BeginBattle`, halves, result calculation. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Manual post-match EXP assignment | Repeated Player videos. | Repeated Coach videos. | Not the core Versus reward path. | `VIDEO_OBSERVED` |
| Twelve detailed Player skills | Repeated skill allocation screens. | Not Coach attributes. | Not directly shown. | `VIDEO_OBSERVED` |
| Coach has six core abilities | Not Player skill layer. | Repeated coach profiles and EXP screens; `CoachAbilityId`. | Separate `BattleCoach` properties. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Injury and recovery choices | Repeated Player screens. | Roster injuries/cards visible. | `ProcessPlayerCondition`, condition flags. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Coach market List/Scout/Deal | Not primary Player market. | Repeated six-video observation. | Scout arrays, refresh/day fields. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Coach tactics affect match | Repeated choices and halftime changes. | `CoachTacticsConfig` numerical fields and restrictions. | `GetTacticsAddRatio`, `GetFormationAddRatio`. | `VIDEO_OBSERVED` + `RECOVERY_SCHEMA` |
| Versus has group/season structure | Not visible in Player/Coach videos. | Not visible in Coach videos. | `VersusSeasonConfig`, group IDs, group club IDs; public group-code release note. | `PUBLIC_OFFICIAL` + `RECOVERY_SCHEMA` |
| Versus has scheduled settlement | Not visible in videos. | Not visible in videos. | `Time`, `ProcessSeasonMatch`, `OnTimeChanged`, compact battle data. | `RECOVERY_SCHEMA` |
| Versus is real-time PvP | Not observed. | Not observed. | No endpoint/transport or lobby body recovered. | **Unverified; do not implement as fact** |
| Exact match formula | Not visible. | Not visible. | Method bodies absent. | `RECOVERY_INFERRED` |
| Exact group-code rules | Release note indicates feature, details absent. | Not visible. | Group fields present. | `RECOVERY_INFERRED` |

## Design principles derived from the matrix

First, the three modes must be represented as separate state machines. Player Mode advances a personal career, Coach Mode advances a club-management career, and Versus Mode settles online/group fixtures. A shared generic `Match` type may hold audit metadata, but each mode needs its own input snapshot, result payload, rewards, and progression ledger.

Second, every simulated match must be reproducible and idempotent. Store a fixture or battle ID, input snapshot, simulation seed, result, reward settlement, and final version. Retries must return the existing settlement rather than award money, EXP, or trophies twice.

Third, Discord should implement Versus as asynchronous/server-synchronized initially. Users submit lineup, formation, tactics, and condition state before a round deadline. A scheduler or `/versus settle` fallback processes the battle without requiring both users to be online. If later research proves real-time PvP, a real-time transport can be added without replacing season, group, battle, and settlement aggregates.

Fourth, all formula knobs should remain centralized and labeled. The matrix does not authorize copying numeric ratios from guessed behavior. The implementation may use calibrated `RECOVERY_INFERRED` formulas, but every such parameter must be named, tested, and documented.

## References

[1]: https://www.youtube.com/playlist?list=PLsfSDuKrLeQ3l_eDt6IKrcthK-L5r1h0N "Player career video playlist"

[2]: https://www.youtube.com/watch?v=hclwbUmsET4 "Coach career, season 1"

[3]: https://www.youtube.com/watch?v=sfozu7UHd0o "Coach mode, season 21"

[4]: https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko "Korean App Store listing and release metadata"

[5]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — NamuWiki"
