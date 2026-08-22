# Gameplay Research Sources

Tanggal riset: 2026-08-21.

## Official store descriptions

| Sumber | Temuan gameplay yang dipublikasikan |
|---|---|
| [Apple App Store](https://apps.apple.com/us/app/football-rising-star/id1585604439) | Game memiliki dua mode unik: **Coach mode** dan **Player mode**. Player mode dimulai sebagai remaja berbakat usia 15 tahun yang bergabung dengan klub profesional; karier mencakup kompetisi, training, transfer, dan target membantu tim menjadi juara selama 20 tahun. Coach mode dimulai sebagai mantan bintang yang mengelola klub, berhadapan dengan klub besar, membangun tim, dan memakai formasi/taktik yang berubah-ubah. |
| [Google Play](https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US) | Deskripsi platform kedua mengonfirmasi dual mode Player/Coach, karier pemain sejak remaja usia 15 tahun, kompetisi/training/transfer selama 20 tahun, serta coach loop dengan klub besar, pembangunan tim, formasi, dan taktik. Halaman juga menandai game sebagai sports/coaching/single-player. |

## Hypotheses to validate against client recovery

Store copy membuktikan adanya dua fantasy yang berbeda, tetapi tidak menjelaskan seluruh formula. Client recovery harus dipakai untuk memvalidasi apakah Coach mode memiliki roster, formation, tactics, club/league/season state, battle rules, event choices, transfer contracts, dan progression terpisah. Player mode bot saat ini sudah memiliki career/club loop, tetapi usia awal sebaiknya diselaraskan menjadi 15 untuk mendekati store description apabila tidak bertentangan dengan data client.

Official descriptions are product claims, not proof of exact numeric rules. Formula, live backend, balance, and content must remain labelled `RECOVERY_VERIFIED`, `OFFICIAL_CALIBRATED`, or `RECOVERY_INFERRED` according to evidence.

## Community and walkthrough evidence

| Sumber | Temuan yang terobservasi atau dilaporkan |
|---|---|
| [NamuWiki — Football: Rising Star](https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80) | Komunitas memisahkan player mode, manager/director mode, dan match mode. Halaman menyebut lima liga besar, stamina recovery berkali-kali selama season, injury dengan durasi 1–6 minggu, retirement sekitar usia 34, rebirth, serta achievement categories untuk career/challenge/property/team/money/event. Ini community evidence dan perlu divalidasi terhadap client, bukan dianggap formula resmi. |
| [Gameplay Walkthrough Part 1](https://www.youtube.com/watch?v=sS5T8E43LQI) | Walkthrough yang dianalisis memperlihatkan onboarding player usia 15 sebagai striker, profile PHY/SPD/DEF/TEC/STA, detailed skills Shots/Penalty/Header/Pass/Dribbling/Free Kick/Off-ball Running/Hold Off Defenders/Teamwork/Endurance/Speed/Willpower, regular training, trick training seperti Bicycle Kick, personal trainers, culture study, energy/rest/injury treatment, simulated match, manual post-match Assign EXP, narrative choices, weekly progression, league table, contract/negotiation, Hall of Honor, dan annual World Footballer event. Temuan video dicatat sebagai observed UI/system evidence; formula dan backend masih belum diketahui. |

## Client recovery evidence: config and save-state schema

Recovery dump `dump.cs` provides the following concrete schema evidence. It is not original C# source and does not expose method bodies, so field existence is stronger evidence than any formula inferred from it.

| Area | Recovery evidence | Implementation implication |
|---|---|---|
| Ability | `AbilityConfig` contains `name`, `KingName`, and six derived coefficients `atk`, `def`, `speed`, `power`, `strength`, `technique`; `AbilityLevelConfig` contains `level`, `totalExp`, and `upExp`. | Keep six macro attributes as derived/read-only summaries while storing detailed player skills separately. The detailed labels are supported by walkthrough evidence, not by this config class alone. |
| Position | `PositionConfig` contains `hpConsume`, `initAbility`, `coachAbility`, `coachFormation`, plus `StealsStlsRatio`, `HurtRatio`, `YellowCardRatio`, `GoalRatio`, `AssistsRatio`, and user-specific ratios. | Position must influence energy/HP cost, injury/card likelihood, goal/assist contributions, and initial skill allocation. Numeric values are not recovered, so formulas remain `RECOVERY_INFERRED`. |
| Player training | `RoutineTrainConfig` contains `expBase` and an `abilitys` list; `SkillTrainConfig` contains `expBase`, target `abilitys`, `trainTime`, `requires`, ad/diamond options, and `hpSpend`. | Implement routine training, skill/trick training, prerequisites, training duration, and HP cost as separate systems. The config naming strongly supports a two-track training model. |
| Personal trainers | `PersonalTrainerConfig` contains `type`, `ratio`, and `weekCost`; there is also a parallel `CoachPersonalTrainerConfig` with the same fields. | Personal trainers are weekly contracts/passive modifiers, with separate Player and Coach catalogs. Exact tier ratios/costs are not decoded from encrypted payload bytes. |
| Player events | `GameEventUserConfig` contains name/icon/description, library, and `MINAge`/`MAXAge`; `GameEventUserChooseConfig` contains `gameEventId`, `cost`, `reward`, plus parsed cost/reward lists and message helpers for energy, money, and ability names. | Events should be age-gated, multi-choice, and data-driven with typed costs/rewards rather than hard-coded narrative text. |
| Coach events | `CoachGameEventUserConfig` and `CoachGameEventUserChooseConfig` mirror the player event structure, confirming a separate Coach event catalog. | Coach mode needs its own event pool and effects rather than reusing Player events blindly. |
| Honor | `HonorConfig` contains `Type`, `Position`, `ConditionType`, `ConditionCount`, `Param`, diamond reward caps, title/gain icons, and congratulation message. `CoachHonorConfig` is a parallel simpler schema. | Hall of Honor must support typed categories, progress conditions, rewards, and title records for Player and Coach. |
| League and rounds | `LeagueConfig` contains round rule, home-team ratio, prestige, spectator parameters, level, and Champions League places. `RoundConfig` contains league/season/round/time. `RoundBattleRuleConfig` contains `battles` and parsed battle list. | Match scheduling and competition structure should be driven by season/round state, not by a single match counter. |
| Season timing | `SeasonCDConfig` stores season name, cooldown name, cooldown seconds, and `CanClear`; the 202603 payload is directly readable and includes season labels with mostly 30-minute cooldowns plus periodic 8-hour cooldowns. | Weekly/season progression needs explicit time gates and a clearable cooldown state; exact production cooldowns are not necessarily appropriate for Discord. |
| Save state | `TrainSaveData` stores routine points, routine levels, skill train dictionary, skill points, settlement timestamps, power points, and Los Angeles training state. `GameEventSaveData` stores event index, battle-end trigger ratio, club-event trigger time, and club/league dictionary. `UserClubSaveData` stores contract dates, club feeling, salary/job-hop timestamps, contract dictionary, club stay time, and win/no-loss streaks. | Domain state should include pending training, settlement timestamps, event trigger state, contract lifecycle, club relationship, and streaks. |

### Payload decoding boundary

The client audit contains both directly structured payloads (for example `cfg_seasonCD_202603`, with readable length-prefixed strings) and obfuscated payloads (for example `cfg_ability`, `cfg_position`, `cfg_personalTrainer`, and `cfg_honor`). The recovery dump exposes their field schemas but not the decryption method body. Therefore, no numeric ratio, level cap, trainer tier value, or injury formula should be presented as official. Any bot formula added from these fields must be labeled `RECOVERY_INFERRED` and remain centralized for later calibration.

## Gameplay gap identified

Bot saat ini masih terlalu ringkas pada skill model: enam ability (`atk`, `def`, `speed`, `power`, `strength`, `technique`) belum mencerminkan detailed skill allocation dan training point loop yang terlihat di walkthrough. Bot juga belum memiliki explicit `Next Week` time progression, injury duration/treatment, trick training unlocks, personal trainers, culture study/charm, manual post-match EXP assignment, Hall of Honor trophy categories, contract squad rank, annual World Footballer award, atau full Coach mode. Ini menjadi prioritas gameplay expansion.


## Mode count verification — 2026-08-22

Official Google Play and Apple App Store descriptions state that Football Rising Star has **two unique gameplay modes: Coach mode and Player mode**. The official descriptions characterize Player mode as a 15-year-old player's 20-year career and Coach mode as a retired star's coaching career. [Official Google Play](https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US) [Official Apple App Store](https://apps.apple.com/us/app/football-rising-star/id1585604439)

The community NamuWiki page adds an important distinction: it describes Player mode, Director/Manager mode, and a **match mode that opens after completing a season in manager mode**. Its table of contents separately lists Player mode and Director mode, while the recovery dump shows distinct `Versus*` and `CoachBattle*` subsystems. Therefore, the defensible classification is **2 official top-level modes**, with manager/Coach competitions containing a match/versus sub-system rather than a third official top-level mode. [NamuWiki](https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80)

The official store pages do not describe Coach mode as multiplayer. The recovery dump demonstrates network-aware synchronization and versus/season data structures, but it does not expose the original server protocol or prove that every Coach opponent is a live human. Any claim that Coach mode is inherently multiplayer must therefore be labeled `RECOVERY_INFERRED` unless supported by additional official documentation or controlled network evidence.


## Versus Mode public evidence — 2026-08-22

A Korean App Store listing for Football Rising Star contains release-note text indexed in public search results stating that **Versus Mode added a group-code function**, **advanced scouting**, and **player condition improvement**. This is stronger public evidence that Versus is a distinct mode with group-based online participation, separate from the two store-marketed Player/Coach career modes. The App Store page itself is [Football Rising Star Korean listing](https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A징스타/id1585604439?l=ko), and the indexed release-note wording must still be treated as store metadata rather than proof of the complete server protocol.

NamuWiki's current page states that a **match/battle mode opens after completing one season in Director/Coach mode**. A third-party game listing claims players fight others online in a free-for-all/semi-battle-royale style, but this source is not official and is not sufficient to establish exact rules. The recovery dump provides stronger implementation evidence: `VersusUser` lifecycle, `VersusUserSave`, `VersusSeasonConfig` with group IDs, `VersusBattleMiniData` with home/away IDs, scheduled time, goals and side rewards, and `VersusBattle`/`VersusBattleClub` with two-half simulation, tactical/formation effects, player lists, cards, shots, corners, MVP, and result settlement. These findings support a distinct online, group-based, time-driven Versus Mode; real-time simultaneous control remains unverified.


## Direct App Store screenshot evidence for three modes — 2026-08-22

The Singapore App Store page for version 2.8.0 visibly shows a main-menu screenshot with three separate buttons: **Player Mode**, **Coach Mode**, and **Versus Mode**. The same page identifies developer Babuyo Games, version 2.8.0 dated 12 Jun, and the public release-note snippet indexes battle-mode additions such as group code, advanced scout, and player-status improvement. This directly supports treating Versus as a first-class product mode rather than merely a Coach sub-feature. [Singapore App Store](https://apps.apple.com/sg/app/football-rising-star/id1585604439?platform=tv)
