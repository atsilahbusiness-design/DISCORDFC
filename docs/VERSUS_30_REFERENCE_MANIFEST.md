# Versus Mode — 30-Reference Manifest

**Date:** 2026-08-22  
**Scope:** Football Rising Star Versus/Battle Mode  
**Rule:** References are evidence inputs, not all equally authoritative. Official store text and screenshots are `PUBLIC_OFFICIAL`; community pages are `PUBLIC_COMMUNITY`; video artifacts are `VIDEO_CONTEXT` unless Versus is visibly present; recovery entries are `RECOVERY_SCHEMA` and prove structure, not original server formula.

## A. Official sources — 6

| # | Reference | URL | Relevant signal | Confidence |
|---:|---|---|---|---|
| 1 | Google Play English listing | https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US | Official description, dual career marketing, version 2.8.0, single-player store classification. | `PUBLIC_OFFICIAL` |
| 2 | Google Play Korean listing | https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=ko | Korean official description and version/update metadata. | `PUBLIC_OFFICIAL` |
| 3 | Apple App Store Australia | https://apps.apple.com/au/app/football-rising-star/id1585604439 | Official description, Player/Coach claims, 20-year Player career, Coach tactics, version 2.8.0. | `PUBLIC_OFFICIAL` |
| 4 | Apple App Store Singapore TV | https://apps.apple.com/sg/app/football-rising-star/id1585604439?platform=tv | Official screenshot visibly shows separate Player Mode, Coach Mode, and Versus Mode menu buttons. | `PUBLIC_OFFICIAL` |
| 5 | Apple App Store Korean listing | https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko | Official Korean release-note metadata indexed with group code, advanced scout, and player-status improvements in battle mode. | `PUBLIC_OFFICIAL` |
| 6 | Apple App Store France/Cameroon regional listing | https://apps.apple.com/fr/app/football-rising-star/id1585604439?l=en-GB&platform=tv | Regional official version history and consistent Player/Coach description. | `PUBLIC_OFFICIAL` |

## B. Community and third-party sources — 8

| # | Reference | URL | Relevant signal | Confidence |
|---:|---|---|---|---|
| 7 | NamuWiki Korean | https://namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 | Explicitly separates Player, Director/Coach, and battle mode unlocked after a Coach season; records injury, league, and retirement behavior. | `PUBLIC_COMMUNITY` |
| 8 | NamuWiki English mirror | https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 | Translated community account of battle mode, leagues, retirement, rebirth, and achievements. | `PUBLIC_COMMUNITY` |
| 9 | Naver review — game overview | https://m.blog.naver.com/alex_k_yura/222744927988 | Reports next-round simulation, EXP by result, position-specific abilities, transfers, club goals, Coach tactics, and dismissal. | `PUBLIC_COMMUNITY` |
| 10 | Naver Player guide — ST | https://m.blog.naver.com/alex_k_yura/222747970144 | Reports rebirth, skill specialization, trophies, World Cup, career strategy, and late-career stat behavior. | `PUBLIC_COMMUNITY` |
| 11 | Naver Player series — ST episode 4 | https://m.blog.naver.com/oh4040/222982363501 | Player progression, transfer mistakes, form, national team context, and career persistence. | `PUBLIC_COMMUNITY` |
| 12 | Naver Player series — LB episode 1 | https://blog.naver.com/oh4040/222961414696?viewType=pc | Additional position/career player experience; extraction was limited, so use as low-weight corroboration. | `PUBLIC_COMMUNITY` |
| 13 | Aptoide version history | https://babuyo-games.en.aptoide.com/app | Version 2.8.0/2.7.0 history, date, package metadata, and official-description mirror. | `THIRD_PARTY_METADATA` |
| 14 | Soft112 version listing | https://football-rising-star.soft112.com/ | Version 2.8.0 listing and update date; Battle Mode changelog text was indexed in search but not fully reproduced on the page. | `THIRD_PARTY_METADATA` |

## C. Video references — 8

These videos were analyzed as mode context. None of these eight shows a confirmed dedicated Versus lobby or a human-vs-human session; that absence is negative evidence only and does not invalidate the separate Versus system.

| # | Video | URL | Research use | Confidence |
|---:|---|---|---|---|
| 15 | Coach career, season 1 — Cultural Leonesa | https://www.youtube.com/watch?v=hclwbUmsET4 | Coach creation, club offer, board target, market, tactics, 38-round season. | `VIDEO_CONTEXT` |
| 16 | Coach mode, season 21 — Hellas Verona | https://www.youtube.com/watch?v=sfozu7UHd0o | Coach market List/Scout/Deal, opponent info, halftime changes, QCL, job offers. | `VIDEO_CONTEXT` |
| 17 | Coach career, season 28 | https://www.youtube.com/watch?v=OcLLGz2hq_o | Multi-season Coach career, formations, tactics, coach EXP, staff, events. | `VIDEO_CONTEXT` |
| 18 | Coach career, season 32 | https://www.youtube.com/watch?v=YWWDntsADP4 | Dismissal, job hunting, retirement/rebirth, roster injuries and match statistics. | `VIDEO_CONTEXT` |
| 19 | Gameplay Walkthrough Part 1 | https://www.youtube.com/watch?v=sS5T8E43LQI | Official-menu context, Player/Coach/Versus screenshot discovery, Player training and awards. | `VIDEO_CONTEXT` |
| 20 | Player career, season 1 | https://www.youtube.com/watch?v=UTpBYprcDgM | Early Player weekly loop, simulated match, manual EXP, injury and event system. | `VIDEO_CONTEXT` |
| 21 | Player career, season 3 | https://www.youtube.com/watch?v=KFbXIo-5A0k | Transfer, contract, trick/personal training, position progression. | `VIDEO_CONTEXT` |
| 22 | Player career, season 16 | https://www.youtube.com/watch?v=qgoh3fEYZmI | Mid/late Player progression, elite club, awards, economy, simulated fixtures. | `VIDEO_CONTEXT` |

## D. Recovery schema references — 8

| # | Recovery reference | Location | Direct evidence | Confidence |
|---:|---|---|---|---|
| 23 | `VersusUser` | `dump.cs` lines 30672–30845 | User status, login/logout, enrollment/game/game-over checks, time-change procedure, separate Versus economy and club. | `RECOVERY_SCHEMA` |
| 24 | `VersusUserSave` | `dump.cs` lines 44381–44592 | Separate club/league/economy, season maps, score and goal-difference dictionaries, scouts, sponsors/exchange, async match processing, player condition. | `RECOVERY_SCHEMA` |
| 25 | `VersusSeasonConfig` | `dump.cs` lines 35740–35817 | Season ID, league ID, group ID, grade, group club IDs, creation time, other-club/NPC lookup. | `RECOVERY_SCHEMA` |
| 26 | `VersusBattleMiniData` | `dump.cs` lines 35821–35959 | League type, battle ID, home/away IDs, scheduled time, state, goals, side rewards, embedded battle data. | `RECOVERY_SCHEMA` |
| 27 | `VersusBattle` | `dump.cs` lines 17430–17605 | Home/away battle, two halves, battle end, result calculation, formation/substitution, MVP, summaries. | `RECOVERY_SCHEMA` |
| 28 | `VersusBattleClub` | `dump.cs` lines 17608–17835 | Ball control, shots, on-target, corners, cards, awards, player list, playing list, tactic/formation hooks. | `RECOVERY_SCHEMA` |
| 29 | `VersusClub` | `dump.cs` lines 35992–36180 | Club identity, grade, goals, rank, score, W/D/L, goal difference, roster, player statistics. | `RECOVERY_SCHEMA` |
| 30 | `BattleStruct` + `RoundBattleRuleConfig` | `recovery_gameplay_config_signatures.txt` and `dump.cs` | Round pairing and battle-rule structures for fixture generation. | `RECOVERY_SCHEMA` |

## Reference-quality conclusion

The strongest Versus evidence is the combination of the official App Store screenshot showing a separate Versus Mode button, official Korean release metadata mentioning group-code and battle-mode features, NamuWiki's explicit battle-mode description, and the dedicated `Versus*` recovery schema. Public videos mainly document Player and Coach and do not show the Versus lobby, so they should not be used to invent real-time behavior. The recovered schema supports a group-based, scheduled, online, server-synchronized competition with club standings and side rewards. Whether it is real-time PvP, asynchronous PvP, or a hybrid remains unverified.
