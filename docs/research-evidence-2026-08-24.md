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


## Riset ulang 2026-08-26

The refreshed Google Play listing states that the current public product is presented as two unique modes, Player and Coach, with no tedious operation/easy simulation, a fast rhythm, diverse tactics, trophies, and hundreds of achievements. It explicitly describes Player as a 15-year-old joining a professional club over 20 years of competitions, training, and transfers, and Coach as a retired star managing clubs with changing formations and flexible tactics. The listing was updated 12 June 2026 and exposes user reports describing repeated week taps, stamina/energy depletion, injury recovery, season waits, ad-gated recovery, and forced retirement; these user reports are evidence of observed live behavior but not official rules or formulas.

The refreshed UK App Store listing confirms the same Player/Coach description, version 2.8.0 (12 June), in-app purchases, advertisements, and public complaints about waiting after seasons, energy/injury recovery, and forced retirement around 33. These reports strengthen the hypothesis that the original loop is time-gated and resource-gated, but they do not prove exact timers or coefficients.

MWM's interface-decoding page, which states its screenshots/description are sourced from the official store listing but is itself a secondary editorial source, identifies visual surfaces: game mode selection, 4-2-3-1 formation with player ratings, Earth Cup bracket, Hall of Honor, birthplace/position creation, post-match ratings and EXP allocation, award celebration, and Club standings with last/next match. This supports a screen/state-oriented parity target rather than a formula target.

Soft112's public version history records version 2.2.0 as adding battle-mode name change and gold-coin exchange, version 2.7.0 as updating player data, and version 2.8.0 as bug fixes. This is secondary evidence for feature history only; it does not establish server formulas.


## Direct walkthrough trace — 2026-08-26

A newly analyzed public Android walkthrough provides a concrete Player Mode sequence. At 00:00–00:12 it shows character/profile setup, a visible six-attribute radar (SPD, STA, TEC, DEF, OFF, PHY), a successful contract signing, and joining Triumphal Arch in the French B League. The observed loop then proceeds as weekly update/training result → match simulation → post-match EXP allocation → league table.

The same recording shows 80 EXP allocated across detailed skills after the first match, regular training, a later 56-point and 36-point EXP allocation, a Trick Training screen with unlockable Bicycle Kick and Jumping Kick, transfers to Sandhausen in the German B League with a displayed salary of 5000, Basic Treat for injury, Culture Study selecting Arts, a windfall event granting 100 Fans, and Bicycle Kick training accelerated with 50 Diamonds. The recording shows a winter break screen, World Footballer candidates, a holiday King of Soccer event granting +100 EXP to Hold Off Defenders, and a World Player of the Year award. The visible top-right resources are Money and Diamonds; bottom navigation surfaces are Home, Training (Regular/Trick/Personal), Match (Simulation/League), Personal (Contract/Negotiation), and Achievements.

This is direct visual evidence for Player state surfaces and ordering in the recorded build. It is not evidence for exact underlying coefficients, whether all later UI survives in version 2.8.0, or the original server-side formula. The trace exposes concrete parity gaps to audit in DISCORDFC: onboarding contract/club selection, explicit weekly update before match, Fans and Diamonds resource surfaces, bottom-tab-equivalent navigation, winter break/annual awards/events, and transfer salary presentation.


## Direct manager/career walkthrough trace — 2026-08-26

A second public gameplay video shows a two-path main menu with Player Mode and Coach Mode, but the recorded session selects Player Mode. It directly shows birthplace choices including China, Argentina, Brazil, England, Spain, Italy, Germany, France, Malaysia, and Others; position choices including GK, CB, LB, RB, CDM, CM, CAM, LM, RM, and ST; and avatar portraits. A `Signed successfully` popup confirms joining US Boulogne.

The visible management hub presents player rating, age, value, Money, Diamonds, and navigation tabs Home, Ability, Training, Personal, and Club. League screens show round identity (for example Round 1 of French B) and a table with Rank, Team, Played, Won, Draw, Loss, Goal Difference, and Points. The Assign EXP screen exposes position-specific technical attributes; the analyzed goalkeeper example includes Strike, Reaction, Hand Toss, GK Kick, Save Penalty, Hold Position, GK Pass Ball, Command Defense, plus Balance, Jump, and Willpower.

Training surfaces include Regular Training categories Short, Dribbling, Speed, Stamina, Pass, Defense, and Physical; Trick Training with thresholds such as `Unlock at Willpower level 10`; and Personal Training with Junior, Senior, and Master coaches affecting EXP recovery/training effects. Personal finance and negotiation expose Ask for pay, Transfer, and Negotiation; transfer offers show club ranking, position competitiveness (for example Slightly competitive), and weekly salary.

Match simulation visibly lists participating players and performance ratings, with a scoreboard and audience count. Hall of Honor includes World Player of the Year, European Golden Shoe, and League MVP. The recording also shows winter break, World Footballer/Player of the Year selection, and endorsements described as increasing fame and currency. These are direct UI/state observations from the recorded build; they do not establish formulas for recovery, training effects, endorsement payout, or transfer valuation.


## Mandarin/App Store and TapTap review — 2026-08-26

The current Macau App Store page for the Mandarin build exposes official screenshots with a title screen that visibly contains Player Mode, Coach Mode, and Vs/Versus Mode labels, plus formation and roster-style screens. The extracted version text on that page is sparse and does not expose a complete Battle Mode ruleset.

TapTap's official forum page 16 is active and includes guide, feedback, team recruitment, and video categories. The visible posts include screenshot-based match results such as Argentina 4–0 Belgium/Spain/Germany/Netherlands/Italy, with tables showing player ratings and match statistics. Search result text for the same official forum reports a community complaint that C-level battle league opponents can have ratings above 90 and youth goalkeepers above 100 even when the user's average is around 65. This is a balance complaint, not proof of intended matchmaking; it suggests that a naive equal-rating assumption would be unsafe and that opponent strength may be skewed or snapshot-based.

## Coach tactical-counter and Bilibili evidence — 2026-08-26

A public Chinese strategy page dated 2024-12-11 lists a discrete Coach tactic counter chain: Long Pass is countered by Wing Attack; Counterattack by Possession; Middle Breakthrough by Wing Attack; All-out Attack by All-out Defense; Wing Attack by Long Pass; Balanced Attack/Defense by Counterattack and All-out Attack; and Possession by Middle Breakthrough. The page is community/secondary evidence rather than an official rules reference, so it supports exposing a tactic-choice/counter concept but not treating the exact chain as authoritative without in-game confirmation.

A Bilibili upload titled `足球:巨星崛起 百粉之作` (2021-08-21) is a 6-minute compilation with three short episodes labeled Forward (29 years, Champions League), Attacking Midfielder (28 years, Champions League), and Goalkeeper (26 years, Champions League). Its description says the game requires watching many advertisements. The page is useful as corroboration that short repeatable Player-career examples and position-specific runs circulate in the Chinese community, but the embedded player was not available for frame-level inspection in this session; no Versus rules are inferred from it.

## Implementasi evidence-backed — 2026-08-26

Berdasarkan trace Player dan audit state machine, Player weekly flow kini memiliki stage eksplisit `READY → MATCH_READY → EXP_PENDING → READY` (serta `SEASON_BREAK` setelah award). `preparePlayerWeek` hanya melakukan weekly update/recovery/training settlement; `playPreparedWeek` menjalankan match dan menghasilkan pending EXP; `advanceWeek` dipertahankan sebagai compatibility wrapper untuk caller lama. Ini meniru urutan layar yang terlihat tanpa mengubah angka balance yang belum terbukti.

Discord kini menyediakan `/play` sebagai entry tunggal Game Home. Player creation memilih posisi melalui select menu; Player Home memiliki tombol Weekly Update, Match, dan pending EXP allocation. Coach memiliki Coach Home, Round, Club Office, dan Event selector. Component handler tidak lagi melakukan double-defer ketika `InteractionCreate` sudah meng-acknowledge interaction.

Worker Versus kini memproses round yang sudah melewati deadline secara idempotent melalui `processVersusRound`, lalu melakukan season settlement setelah seluruh round selesai. Settlement market tetap berjalan pada worker yang sama. Queue policy, timer asli, MMR, payout, dan semua coefficients tetap diklasifikasikan sebagai inferred sampai ada evidence primer.

Verifikasi perubahan: TypeScript build pass; 73 tests pass; production dependency audit tidak menemukan vulnerability high; diff whitespace bersih; stress simulation 300 trials per mode / 115,770 actions / zero invariant dan determinism failures. Registrasi Discord belum diulang pada sandbox karena credential tidak tersedia di environment dan sandbox REST latency sebelumnya melampaui interaction acknowledgement window.

## Coach walkthrough re-check — 2026-08-26

Walkthrough Coach `hclwbUmsET4` secara langsung memperlihatkan urutan Coach Mode: memilih Coach, membuat role/name dan enam ability awal (Formation, Tactical, State, Training, Locker, Personal), career intro, menerima beberapa **job offer**, memilih klub, lalu **board meeting** yang menetapkan target musim seperti naik ke A League. Artefak analisis tersimpan sebagai `video_hclwbUmsET4_analysis_20260826_144005.md`. Video ini lebih kuat untuk membuktikan bahwa Coach dimulai sebagai figur pensiunan/role Coach dengan job offer dan board target, bukan sekadar Player event yang diganti label.

Walkthrough Coach season berikutnya `S7PZxhfE5pA` memberikan bukti visual/timestamp yang jauh lebih spesifik. Ia memperlihatkan job offer dan pergantian klub, board goals seperti promotion dan avoid relegation, transfer market dengan tab List, Scout, Sell/Player List, dan Deal, formation/tactic sebelum match serta penyesuaian saat halftime, match simulation dengan halftime/fulltime/statistics/ratings, season summary dan relegation notice, Coach of the Year/Award Ceremonies/Best of Round, serta energy recovery via video ad.

Video yang sama memang memperlihatkan **interactive Coach decision events**, antara lain Team-Building (`Go Fishing`, `Island Tour`, `Tea Time`), Press & Media (`The Leak of Tactics`, `TV Show`), Locker Room Speech, Clique/Locker Room Crisis, Youth Training/Youth System Star, Budget, Team Doctors, dan failure to reach seasonal goals. Ini adalah evidence langsung bahwa Coach mempunyai event/decision layer yang terkait manajemen klub dan muncul di antara round/match/season, bukan asumsi generik. Artefak tersimpan sebagai `video_S7PZxhfE5pA_analysis_20260826.md`.

Koreksi terhadap implementasi saat ini: `CoachEvent` generik di `coach-career-engine.ts` hanya memiliki lima template inferred (`press-criticism`, `locker-room-speech`, `team-building`, `player-discipline`, `financial-crisis`) dan peluang event sesudah `advanceCoachRound`. Ini menangkap konsep secara kasar tetapi belum memodelkan event sebagai bagian dari structured Coach timeline dan belum memiliki event families yang terlihat langsung seperti Team Doctors, Youth System, TV Show, Budget, Clique, dan seasonal-goal failure. Sebaliknya, `PlayerProfile.event` di `progression-engine.ts` adalah daily random event dengan template `academy-visitor`, `sponsor-call`, `locker-room`, `media-interview`, dan `teammate-meal`; template-template ini tidak boleh dianggap sebagai event asli hanya karena namanya terdengar masuk akal.

Official Google Play/Apple listings tetap hanya menyatakan Player dan Coach sebagai dua unique modes, fast/easy simulation, training/transfers untuk Player, serta formations/tactics/club management untuk Coach. Review pengguna menyebut pola tap tiga tombol untuk memainkan satu minggu, energy/injury recovery, dan waiting/ads; review tidak cukup untuk menetapkan event formula. [Official Google Play](https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US) [Official Apple App Store](https://apps.apple.com/gb/app/football-rising-star/id1585604439) [Coach walkthrough season 1](https://www.youtube.com/watch?v=hclwbUmsET4) [Coach walkthrough season 2](https://www.youtube.com/watch?v=S7PZxhfE5pA)

## Event model correction implemented — 2026-08-26

Perubahan kode sekarang menghentikan `generateDailyEvent()` dari onboarding Player dan maintenance worker. `EventState`/`EventChoice` tidak lagi menjadi contract aktif Player; legacy JSON dengan key `event` dipertahankan sebagai data yang diabaikan agar migrasi tidak merusak profile lama. `/player career event` dihapus dari registry publik. Alias stale tetap diarahkan ke `player-event-disabled` agar command lama menerima penjelasan dan tidak membuat atau menyelesaikan event maupun memproses `cost` Money.

Daily reward tetap tersedia sebagai reward claim terpisah. Tidak ada perubahan pada daily reward yang boleh ditafsirkan sebagai Player event.

`CoachEvent` kini memiliki optional metadata `family`, `trigger`, dan `blocking`. Event yang saat ini memang dihasilkan engine diklasifikasikan sebagai `PRESS_MEDIA`, `LOCKER_ROOM`, `TEAM_BUILDING`, atau `FINANCE`, dengan trigger `ROUND_SETTLEMENT` dan blocking default true. Family yang terlihat langsung tetapi belum diimplementasikan—`YOUTH_SYSTEM`, `MEDICAL`, dan event-specific variants seperti TV Show/Budget/Team Doctors—tetap menjadi backlog evidence, bukan template buatan baru.

Regression coverage memastikan Player profile/maintenance tidak membuat legacy event, registry tidak lagi mendaftarkan Player Event namun Coach Event tetap ada, alias lama masuk deprecation path, dan Coach decision memiliki family/trigger serta memblokir round berikutnya. Build dan 74 tests pass setelah perubahan ini; stress/audit final masih harus dijalankan sebelum commit.
