# Versus UX Evidence Map — 2026-08-22

**Author:** Manus AI
**Purpose:** Menentukan bagian UX Football Rising Star Versus yang dapat direkonstruksi dari sumber publik dan bagian yang masih membutuhkan bukti internal.

## Executive conclusion

> Bukti publik mendukung bahwa produk memiliki tiga entry point, mode battle/friend battle yang terpisah, group code, competition registration, advanced scout, player-status improvement, portrait menu-first navigation, formation/rating setup, fast textual simulation, result/rating screen, standings, and rewards. Bukti publik belum memperlihatkan seluruh screen sequence Versus secara utuh.

Karena itu, target implementasi yang aman adalah **high-fidelity interaction parity** terhadap pola publik: satu hub Versus, group entry, competition state, pre-match roster management, next-match action, simulation, results, standings, and history. Detail yang tidak terlihat diberi `RECOVERY_INFERRED`; detail yang hanya muncul pada komunitas diberi `PUBLIC_COMMUNITY`.

## Evidence table

| UX element | Evidence | Confidence | DISCORDFC mapping |
|---|---|---:|---|
| Three mode entry point | Frame-aware analysis of a public X7Game walkthrough shows `Mode Pemain`, `Mode Pelatih`, and `Vs Versus Mode` at approximately 00:04 and 01:13. | Direct public video | Player/Coach/Versus separation and Versus Home button |
| Portrait, menu-first rhythm | Public walkthrough and Facebook frame show portrait screens, bottom navigation, central next-action controls, and textual/menu-driven progression. | Direct public video/frame | Discord embeds and action-row navigation |
| Formation and rating preparation | Public App Store/MWM carousel annotations show a formation screen with player ratings and a `Start Match` action. | Direct public screenshot annotation | Pre-match formation/tactic setup and XI selector |
| Match result and ratings | Public walkthrough analysis shows textual match result, lineup/rating table, and post-match EXP allocation. | Direct public video | Result embed, MVP/statistics, reward ledger |
| Standings and next match | Public App Store/MWM annotations show club standings and last/next match; walkthrough shows league table columns. | Direct public screenshot/video | Versus Home, Standings, Results, and next battle context |
| Friend battle promise | Public Facebook page caption says `球員+教練雙模式，還可以跟好友對戰！` (“Player + Coach dual mode, and you can also battle friends”). | Public product promotion | Group-code enrollment and multi-club Versus league |
| Group code | Chinese App Store changelog search result says `對戰模式新增分組碼功能`. | Public listing changelog | `/versus-join group_code:<code>` and prominent group code in Home |
| Competition registration | 7723 strategy search result contains `打开对战模式,报名参加比赛` (“open battle mode, register to participate in a competition”). Article body was blocked by verification. | Search-result/community evidence | Existing enrollment flow; explicit registration state remains inferred |
| Advanced scout | Chinese App Store changelog search result says `对战模式新增高级球探功能`; English regional snippet says “Add advanced scout function in battle mode.” | Public listing changelog | Scout surface is a documented gap; do not fabricate prices/formula |
| Player-status improvement | Chinese App Store changelog search result says `对战模式新增提升球员状态功能`. | Public listing changelog | Status/condition UI is visible in roster eligibility; active boost mechanic remains inferred |
| Roster acquisition/retention economy | TapTap/7723 search snippets discuss high-rated players and keeping players with coins. | Public community/search evidence | Separate Versus wallet and roster ledger; exact scout/recruit UX remains unverified |

## Verified Versus video evidence

The public review [Football Rising Star review (Android game, 2021)](https://www.youtube.com/watch?v=KQiUcv9d25c) was frame-analyzed as the strongest direct Versus source found in this research pass. It visibly shows the following sequence: Versus dashboard with next match and latest result at 03:41; lineup at 04:06; match preview with team attack/defence and star-player comparison at 04:27; transfer market `Deal` at 05:00; detailed latest-match statistics at 05:14; `Scout` tab at 05:59; sponsor tiers at 06:31; diamond shop at 07:00; rewards at 07:11; Top Scorers/Saves/Tackles rankings at 07:49–07:55; club detail and fixtures at 07:57; My Schedule at 08:03; and Global Ranking at 08:11.

The Discord implementation now exposes corresponding navigation from Versus Home: `Registration`, `Market`, `Rewards`, `Schedule`, `Rankings`, and `Global Ranking`, in addition to Home, Next Battle, Lineup, Results, and Standings. Market is a read-only preview. Sponsor purchase, diamond spending, advanced Scout offer generation, and Saves/Tackles telemetry remain unimplemented rather than fabricated because their exact costs, effects, and persistence were not visible in the verified source.

## Screen contract derived from evidence

| Screen/state | Must show | Evidence status |
|---|---|---|
| Versus Home | Group code, season/competition, next battle, opponent, deadline/registration state, record, rank, wallet, submission status | Mixed public + recovered domain |
| Competition registration | Group/competition identity, register/enroll action, capacity/state, confirmation | Group code direct; exact layout inferred |
| Roster/Scout | Player identity, position, rating/ability, availability/status, cost/offer state | Formation/rating direct; scout feature direct; exact offer rules inferred |
| Pre-match setup | Formation, player selection, lineup/ratings, tactic, captain, substitutes, confirm/start match | Formation/rating direct; captain/substitutes inferred |
| Simulation | Opponent, final score, concise event/result output, no manual real-time control | Textual simulation direct |
| Result | Score, ratings/MVP, rewards/EXP, next action | Direct for Player; Versus-specific details inferred |
| Competition table | Rank, matches, W/D/L, goal difference, points, next/last match | Direct public table pattern |
| Reward/history | Trophy/reward outcome, history/progression | Direct public reward/trophy pattern; Versus reward exactness inferred |

## Implementation policy

The current Discord implementation follows the screen contract while retaining slash-command fallbacks. Interactive components are owner-bound and carry battle ID plus roster version. A stale component is rejected and the user is instructed to reopen Versus Home. The domain remains authoritative for formation legality, eligibility, deadline, roster version, settlement, and ledger idempotency.

The advanced scout and player-status boost are intentionally not represented as fully implemented mechanics until their exact public flow, costs, persistence semantics, and effect formulas are observed. Showing a fake scout screen would look more similar superficially but would violate the evidence boundary and could corrupt Versus balance.

## References

[1]: https://apps.apple.com/us/app/football-rising-star/id1585604439 — Football Rising Star, official Apple App Store listing.
[2]: https://mwm.ai/apps/football-rising-star/1585604439 — MWM Intelligence page with public screenshot annotations and feature summary.
[3]: https://www.youtube.com/watch?v=hBakdDdTCQw — Public walkthrough titled “AKHIRNYA RILIS! FOOTBALL: RISING STAR X7GAME [ADA 3 MODE YANG BISA KITA PILIH]”.
[4]: https://www.facebook.com/100071929744255/videos/2416609028674860/ — Public Football Rising Star promotional video captioned “Player + Coach dual mode, and you can also battle friends!”.
[5]: https://www.taptap.cn/app/220982/topic?page=16 — Football Rising Star official/community TapTap forum page.
[6]: https://3g.7723.cn/strategy/153211.html — Public strategy page whose search snippet references registering for a battle-mode competition; body was blocked by verification.
[7]: https://www.douyin.com/shipin/7288567676606924834 — Public search result discussing high-rated players in battle mode.
[8]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 — Community page describing Player/Director/Match modes and season/club context; page is community-authored and captcha-protected.
