# Football Rising Star Evidence Log — 2026-08-24

## Source 1 — Official Apple App Store
URL: https://apps.apple.com/us/app/football-rising-star/id1585604439

Observed facts: developer is Babuyo Games; category Sports; current visible release note says “Fixed several bugs.” The description explicitly names two unique gameplay modes: Coach mode and Player mode. Player mode starts the user as a talented teenager aged 15, joining a professional club and progressing through 20 years of competitions, training, and transfers. Coach mode starts as a retired star and emphasizes club management, formations, tactics, trophies, and achievements. The visible screenshots include a title screen with Player Mode, Coach Mode, and Versus Mode labels, plus match/formation and history surfaces. The page does not expose the detailed Versus rules, MMR, auction formulas, Scout/Sponsor costs, or cooldowns.

Evidence level: official product description is high-confidence for Player/Coach and the described career loop; screenshot labels are high-confidence evidence that a Versus surface appears in the public app imagery, but not proof of exact current server behavior.

## Source 2 — Official Google Play
URL: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US

Observed facts: developer is Babuyo Games; listing shows 1M+ downloads, 137K reviews, 4.8 stars, ads and in-app purchases, and an update date of June 12, 2026. The description repeats the two-mode claim, Player mode from age 15 with a 20-year career involving competitions/training/transfers, Coach mode as a retired star with club management, formations and tactics, and features including quick simulation, varied tactics, trophies, and hundreds of achievements. The screenshots are public visual evidence but do not expose a complete Versus lifecycle.

Evidence level: high-confidence for the official description and listing metadata; screenshots support UI-surface existence, not hidden formula or matchmaking claims.

## Current evidence boundary

Do not treat the two official store descriptions as proof that the exact current game has only two playable surfaces, because the App Store screenshot visibly labels Versus Mode. Conversely, do not infer the complete Versus implementation from a title-screen label alone. Versus flow, opponent assignment, league size, auction, Scout, Sponsor, MMR, payout, and cooldown rules require separate direct evidence.

## Source 3 — Public YouTube walkthrough analyzed
URL: https://www.youtube.com/watch?v=hBakdDdTCQw
Analysis artifact: `video_hBakdDdTCQw_analysis_20260824_043054.md`

Directly visible according to multimodal analysis: the main menu shows three labels, Player Mode, Coach Mode, and Vs Versus Mode, at approximately 00:04 and 01:13. The video visibly shows Player dashboard attributes (PHY, OFF, DEF, TEC, SPD, STA), character creation with birthplace/avatar/position/nickname, detailed skill EXP screens, routine/trick/physical training, contract and transfer screens, achievements/trophy surfaces, lineups, match result/ratings/Man of the Match, league table columns including played/win/draw/loss/goal difference/points, and club information with league/rank/schedule/squad composition.

The analyzed footage did not establish a complete Versus lifecycle. It did not provide reliable direct evidence for system matchmaking, exact number of clubs, group-code flow, auction rules, Scout/Sponsor effects, MMR, payout, or cooldown formulas. The video title claims three modes, but the title itself is not gameplay evidence. The direct menu label is stronger existence evidence for a Versus surface; it remains insufficient to reconstruct hidden server rules.

Evidence level: high for the listed visible Player/Coach/menu surfaces; medium for Versus existence because the label is visible; low for any unseen Versus mechanics.

## Source 4 — Public YouTube review analyzed
URL: https://www.youtube.com/watch?v=KQiUcv9d25c
Analysis artifact: `video_KQiUcv9d25c_analysis_20260824_043228.md`

The video description claims it reviews three modes. Multimodal analysis reports visible Versus/battle footage at approximately 13:25–19:11. Reported visible elements include a Versus home with next-match countdown, last result, and online-league standings; a Match Preview around 14:27–14:54 comparing team strength, attack/defense and core players; a time-limited “Deal” auction tab around 16:52; Scout screens around 15:55–16:24; a Sponsor screen around 16:32–16:36 with Junior/Senior/Top labels; rewards based on final league positions around 17:11; and ranking-list screens around 18:11–18:24.

These findings are stronger than a title-only claim because the analysis identifies timestamps and visible UI surfaces, but they still do not establish numeric prices, effects, cooldowns, MMR update rules, exact queue algorithm, season length, or whether all surfaces belong to the same current production build. The analysis also reports match-result surfaces with scores, ratings, possession, shots, shots on target, and corners.

Evidence level: medium-to-high for existence of the listed UI surfaces in the recorded build; low for hidden formulas and exact production behavior.

## Source 5 — Public version-history aggregator
URL: https://football-rising-star.soft112.com/

The page reproduces the official two-mode description and lists version history. It records version 2.2.0 as adding battle-mode functions including name change and gold coin exchange, while versions 2.8.0, 2.7.0, 2.6.0, 2.5.0 and others are listed with bug fixes, player-data updates, or optimization. This is a secondary source and should be treated as corroboration, not authoritative proof of hidden rules.

## Source 6 — APK version index
URL: https://apkpure.net/football-rising-star/com.babuyo.footy.tc.android/versions

The page lists public Android builds from 2.1.2 through 2.8.0, with 2.8.0 dated June 12, 2026 and older versions including 2.2.0, 2.2.1, 2.3.x, 2.4.0, 2.5.0, 2.6.0, and 2.7.0. This confirms version availability/history but does not provide reliable gameplay mechanics.

## Source 7 — NamuWiki community reference
URL: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80

The community page describes Player mode, manager/Coach mode, and a match mode that opens after completing a manager season. It reports Player mode details including a 15-year-old starting point, roughly 20-year career progression, injuries/recovery pressure, five major European leagues plus third divisions, Q-League/Champions-like competition, forced retirement around age 34, and rebirth preserving money while resetting or improving selected progression. It also lists many achievement examples. These are useful hypotheses and gameplay observations, but the page is user-contributed and some translations are ambiguous; it cannot establish official current formulas or Versus server behavior.

## Source 8 — TapTap official forum index
URL: https://www.taptap.cn/app/220982/topic?page=16

The page is the official forum area for the game and visibly exposes categories including guides, feedback, team recruitment, and videos. The index page itself shows community posts with match-score screenshots, but the fetched page did not expose a complete battle-mode guide. Search results for the same TapTap forum include user posts discussing battle-mode player market bidding and coin usage, including claims about preserving a player after bidding; these are user-generated reports and may describe exploits rather than intended mechanics. They must not be implemented as rules without primary confirmation.

Evidence level: low-to-medium for the existence of an active official forum and battle-related community discussion; low for any gameplay rule inferred from forum advice.
