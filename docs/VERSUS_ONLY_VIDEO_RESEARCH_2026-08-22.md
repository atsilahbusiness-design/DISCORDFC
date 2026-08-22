# Versus-only YouTube Research Log — 2026-08-22

## Scope rule

Only videos whose title, description, thumbnail, transcript, or visible frames show `对战模式`, `Vs Versus Mode`, battle mode, friend battle, competition registration, group code, advanced scout, battle roster, or the corresponding Football Rising Star feature are eligible as Versus evidence. Player-career and Coach-career videos are excluded from the Versus evidence count even if they are about the same game.

## Initial search results

| Search/query | Result | Classification |
|---|---|---|
| `Football Rising Star mode versus gameplay Indonesia` | No clear Versus-only YouTube walkthrough; returned App Store, Google Play, one three-mode entry-point video, and unrelated content. | Not yet eligible except the entry-point frame |
| `Football Rising Star versus battle league gameplay` | No clear YouTube Versus gameplay surfaced. | Not eligible |
| `Football Rising Star full gameplay mode coach player versus` | Mostly Player/Coach career series; the 20-video playlist is explicitly Player career. | Excluded from Versus count |
| `足球巨星崛起 对战模式` | Search results returned Douyin/TapTap/App Store evidence and unrelated YouTube content. | Only non-YouTube public clues; no YouTube Versus evidence yet |
| `足球巨星崛起 对战模式 高级球探` | Returned a Player-career video and unrelated football videos; no verified Versus video. | Excluded |

## Explicitly excluded videos

The following are not Versus evidence and must not be counted toward the 30–40 target: the 20-video `Football Rising Star (Footy Star) | Player career` playlist, `Football Rising Star - Gameplay Walkthrough (Android) Part 1`, the `SC career` series, and `coach career`/`coach mode` videos. They are useful only for general product shell context, not Versus UX.

## Current eligible lead

The only YouTube lead currently showing the original product's mode entry point is `https://www.youtube.com/watch?v=hBakdDdTCQw`, whose frame-aware analysis visibly identifies `Vs Versus Mode` on the main menu but does not show Versus gameplay. It is therefore **mode-entry evidence only**, not a Versus screen-sequence reference.

## YouTube-only refinement results

A direct YouTube search for `足球巨星崛起 对战` returned the same Player-career video and unrelated “football duel”/drama content. The relevant-looking `⚽史詩對戰` result is an unrelated production and is not Football Rising Star. A separate search for `足球巨星崛起 对战模式 高级球探` similarly returned a Player-career video and unrelated content. These results are explicitly excluded from the Versus count.

This search behavior suggests that public YouTube indexing is sparse for the exact battle mode, or that relevant videos are titled without the game's name. The next search pass will use creator/channel, Chinese title variants, and App Store changelog terms while manually checking the game identity before counting any video.

## Platform verification

The exact Douyin result `7288567676606924834`, despite the search title mentioning `足球巨星崛起对战模式怎么刷高分球员`, rendered a page whose visible linked content was about `实况足球手游` (eFootball mobile), not Football Rising Star. It is therefore **excluded** from the Football Rising Star Versus video count. This confirms that search snippets can be misleading and each candidate must be opened and identity-checked before analysis.

Bilibili search results also returned Captain Tsubasa: Rise of New Champions videos, which are a different game and are excluded. No additional verified Versus-only video has been added from these searches.

## TapTap official video tab

The official TapTap video tab exposes six user-generated video posts, but the visible titles/content are: archive corruption, transfer failure, a general player-career review, “can you become the next king,” real-name verification, and an official post “second half of the match begins.” None is explicitly a Versus/对战 walkthrough from the visible metadata. The tab is nevertheless a useful primary-community lead because it confirms the official game community has video posts and a match-half concept; individual posts must be opened before any screen is counted as Versus evidence.

Visible post IDs/covers include `video-5133353`, `video-5046391`, `video-3344360`, `video-2469192`, `video-2164742`, `video-2144691`, and `video-2031566`.

## TapTap visual check

The first TapTap video post opened successfully after clicking the embedded player. Its visible screen is a vertical Football Rising Star player-profile/status screen under the post `存档错乱是啥情况` (“what happened to the corrupted save?”), not a Versus screen. It is excluded from the Versus evidence count. This confirms the community tab can be visually inspected, but its first post is not relevant to the requested mode.

The TapTap post detail contains a 27-second HTML video element, but the displayed footage remains the same archive/save-error context and a player-oriented vertical UI. It is not counted as a Versus video. The browser interaction confirmed the video is playable in-page, but its current screen is not the requested mode.

The TapTap video tab page 2 is empty and shows “no more content.” The first page has only the six visible video posts listed above. This rules out treating the whole TapTap forum as a hidden 30–40-video Versus archive.

## Candidate video verification

`https://www.youtube.com/watch?v=2JAfAo0BIl8` (Football Rising Star Official Launch) was frame-analyzed. It shows Player Career: character creation, training, league matches versus AI, Earth Cup, awards, and career events. No Vs Versus/对战 screen appears. Classification: **EXCLUDE**.

## Verified Versus video

`https://www.youtube.com/watch?v=KQiUcv9d25c` (Football Rising Star review) is the first verified full Versus-specific visual source in this pass. Frame-aware analysis confirms:

| Timestamp | Verified screen/UX |
|---:|---|
| 03:41 | Versus main menu with club ranking, next match `FC Ukraine vs Real Madrid`, and latest match result |
| 04:06 | Versus lineup screen |
| 04:27 | Match preview comparing team strength, attack/defence, and star-player statistics |
| 05:00 | Transfer market `Deal` tab |
| 05:14 | Detailed latest-match result statistics |
| 05:59 | Transfer market `Scout` tab |
| 06:31 | Sponsor selection: Junior, Senior, Top Sponsor |
| 07:00 | Premium-currency shop/diamond purchase screen |
| 07:11 | Rewards list for league position and player achievements |
| 07:49–07:55 | Ranking tables: Top Scorers, Saves, Tackles |
| 07:57 | Club detail for FC Ukraine with season statistics and fixture list |
| 08:03 | My Schedule screen |
| 08:11 | Global Ranking list |

This video materially changes the UX evidence baseline. It proves that the original Versus UX is not only a registration/lineup flow: it also has a compact Versus dashboard, explicit next match/result cards, match preview, transfer market with Deal/Scout tabs, sponsor tiers, premium shop, reward page, multiple leaderboard categories, club detail, schedule, and global ranking. These surfaces are now high-priority implementation targets for DISCORDFC.

`https://www.youtube.com/watch?v=f1lWVFTy-ac` (`(足球:巨星崛起) 首款養成類球遊戲，玩法分享試玩系列`) was frame-analyzed and showed only Player Career. No 对战/Vs Versus screen appeared. Classification: **EXCLUDE**.

## Primary verified Versus walkthrough

`https://www.youtube.com/watch?v=V8MsDUXNl8A` (`Footy Star Versus Mode | No Commentary | Day1`) is an explicitly Versus-only walkthrough and provides the strongest direct UX evidence in this research.

| Timestamp | Verified UX |
|---:|---|
| 00:16–00:23 | Three-mode selector with Player, Coach, and Versus Mode; user enters Versus |
| 00:24–00:55 | Pre-dashboard identity/setup sequence: country selection (including Indonesia), crest/logo gallery, club name input (`DraWings`); ownership semantics are not established |
| 01:03–01:22 | Versus dashboard with club name, cash, coins, energy, tutorial/welcome message, sign-up status |
| 01:12 | Competition registration: `Sign-up` becomes `Registered`; group-division timestamp shown as `01/05 19.00` |
| 01:23 onward | Market/Deal tab with auction listings: player, score, age, position, bid, and countdown/dual time |
| 01:32–01:42 | Scout tab with direct recruit/normal scout action and visible cost (`250K` in the footage) |
| 01:43 onward | Pitch-based lineup screen with starters, bench, formation choices (`442`, `4231`, `433`, `4411`, etc.) |
| 01:53 | Tactical instruction popup: counterattack, centre penetration, tiki-taka, long ball, all-out attack, all-out defence, and related choices |
| 02:45, 04:12 | Sponsor/reward surface with Junior/Senior sponsor choices and reward claim flow |
| 04:14 | Ranking tabs: champion, MVP, golden boot/top scorer, top assist, and goalkeeper ranking |

The verified bottom navigation contains five primary destinations: Market/cart, pitch/lineup, Home/dashboard, trophy/rankings, and handshake/sponsor. The top status bar shows crest/club name, cash, coins, and energy. Screen-specific controls include Refresh and normal scout cost, blue Bid buttons, and tactical Instructions.

This evidence changes the implementation priority: the original Versus UX is a **system-managed battle/competition surface with roster management and scheduled league state**, not merely a lineup submission form. Auction countdowns, scout/recruit UX, pre-dashboard country/logo/name setup, energy, sponsor selection, and multi-category rankings are proven visual targets; the ownership meaning of the setup screen remains unresolved. Exact matchmaking/queue rules, auction economics, timer semantics, scout refresh rules, sponsor payout tables, and player-status effects remain unverified mechanics and must be implemented only after their rules can be audited.

## Search coverage and honest classification

The exhaustive YouTube query pass indexed 54 result rows and 47 unique video IDs across English/Indonesian/Chinese variants. Fifteen IDs contained a Versus/battle/对战 token, but manual title classification showed that most were unrelated football games, music, commentary, or generic battle content. The Football Rising Star-specific direct sources verified in this pass are:

1. `V8MsDUXNl8A` — explicit `Footy Star Versus Mode | No Commentary | Day1`, a dedicated Versus walkthrough with pre-dashboard identity/setup, market/scout, lineup, tactics, sponsor, rewards, and rankings.
2. `KQiUcv9d25c` — `Football Rising Star review (Android game, 2021)`, a three-mode review with a substantial Versus segment covering dashboard, next match, lineup, preview, Deal/Scout, sponsor, rewards, rankings, club detail, schedule, and global ranking.

Several other Football Rising Star IDs were frame-checked and excluded because they were Player Career or general career gameplay, including `2JAfAo0BIl8`, `f1lWVFTy-ac`, and `iZwPKHBiPes`. The explicit Versus-only source count is therefore not inflated by treating search-result quantity, unrelated “battle” titles, or career videos as Versus evidence. The evidence map distinguishes indexed candidates from videos actually verified as the requested mode.
