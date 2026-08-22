# Versus UX Research Notes — 2026-08-22

## Public references reviewed

1. **Apple App Store listing — Football Rising Star**: The official listing states that Player Mode begins with a talented teenager at age 15 and follows a 20-year loop of competitions, training, transfers, and championships. It describes Coach Mode as managing a club through formations and tactics. The public description emphasizes fast simulation, low operational burden, diverse tactics, trophies, and achievements. The listing screenshot carousel visibly shows a mode selection screen with Player Mode, Coach Mode, and Versus Mode labels, a football formation screen with player ratings and formation choices, a tactical/lineup pitch screen, and a Hall of Honor screen.
2. **Google Play listing**: Browser navigation timed out in the current environment, so no additional content was relied on from that page.

## Initial UX implications

The public App Store material supports a **fast-simulation, management-first** experience rather than a real-time action match. The visible screens suggest that lineup/formation and tactical decisions should be presented as a visual pre-match preparation step, followed by a fast result/simulation screen. The public screenshot explicitly includes a Versus Mode label in the mode selection surface, but the listing text does not document the complete Versus interaction contract.

## Evidence boundary

The App Store description and screenshots are public product evidence, not proof of server protocol or every Versus rule. Exact Versus lobby, group capacity, fixture cadence, submission timing, and reward behavior still require additional public walkthroughs or company-provided screenshots/configuration. Any Discord UX implementation should reproduce the observable interaction pattern while using original bot copy and non-proprietary assets.

## Additional public walkthrough evidence

3. **YouTube walkthrough — Football Rising Star Gameplay Walkthrough (Android), Part 1**: The accessible page confirms a public Android gameplay walkthrough, but the page-level extraction exposes only title/channel metadata rather than a transcript or frame-by-frame UI details. It is therefore treated as a lead for visual inspection, not as evidence for an unobserved Versus rule.
4. **YouTube playlist — Football Rising Star by Noob de Noob**: The playlist exposes two public Coach Mode videos, one approximately 1:27:40 and another approximately 59:43. The playlist itself confirms that long-form walkthrough material exists for the management loop, but it does not expose Versus-specific metadata or a transcript in the accessible page extraction.

## Refined conclusion

The strongest directly inspectable UX evidence currently available is the official App Store screenshot carousel: mode selection, formation/ratings setup, tactical pitch setup, and trophy/history navigation. Public video pages are useful references but require manual video-frame review or local video analysis to derive exact screen order. The Discord implementation should therefore prioritize the observable management pattern: a clear mode/lobby home, visual formation and roster preparation, a concise confirmation step, fast simulation, and a persistent standings/history view.

## Frame-aware walkthrough analysis

5. **Video analysis of Part 1 walkthrough**: The observed UX uses a persistent bottom navigation/home hub, a central match action, fast off-screen simulation, pre-match starting XI with ratings, a result screen with score/audience/player ratings, followed by league results and standings. The walkthrough also shows management popups for contract/signing, negotiation, training, awards, random events, injury treatment, and recovery. No dedicated Versus flow was visible in this video, so these observations should guide the pacing and information hierarchy rather than be treated as proof of Versus-specific networking.

## UX translation for Versus

The closest defensible translation is not a command-only API. Versus should feel like a persistent home hub with a prominent next battle action, a pre-match lineup screen, a concise simulation/result sequence, and a standings screen. Discord cannot reproduce a mobile bottom navigation bar literally, so the equivalent should be a persistent embed with action rows: **Versus Home**, **Next Battle**, **Lineup**, **Tactics**, **Results**, and **Standings**. The bot should keep the same low-friction simulation rhythm observed in the walkthrough while adding the multiplayer-specific group, deadline, and submission state required by the recovered Versus model.

## References

[1]: https://apps.apple.com/nl/app/football-rising-star/id1585604439?l=en-GB — Football Rising Star, official Apple App Store listing.
[2]: https://www.youtube.com/watch?v=sS5T8E43LQI — Football Rising Star - Gameplay Walkthrough (Android) Part 1.
[3]: https://www.youtube.com/playlist?list=PLIRxtsPLuKj8GzCdFMEROcuTJZfcS69UG — Football Rising Star public walkthrough playlist by Noob de Noob.

## Additional public references

6. **MWM Intelligence app page**: Public screenshot annotations identify a mode-selection screen, strategic formation setup showing a `4231` example and player ratings, tournament bracket progression, Hall of Honor, post-match player ratings and experience allocation, and club standings with last/next match. The page's text and annotations are useful UX evidence, but it describes the visible product broadly and does not expose a complete Versus-specific flow.
7. **YouTube video titled “AKHIRNYA RILIS! FOOTBALL: RISING STAR X7GAME [ADA 3 MODE YANG BISA KITA PILIH]”**: The title explicitly advertises three selectable modes, making it a lead for Versus-related visual inspection. Page extraction provides title/channel metadata but no transcript or frame details, so the title alone is not treated as evidence of the exact Versus interaction.

## Community and regional listing evidence

8. **NamuWiki community page**: The extracted page describes Player Mode, Director/Coach Mode, and a match mode that opens after completing a manager season. It also documents club standings terminology, Q-League/Champions context, injury/recovery interruptions, and fixed starting-created players. The page is community-authored and partially translated, so it is treated as `PUBLIC_COMMUNITY`, not official configuration. It does not expose a complete Versus screen sequence.
9. **US Apple App Store listing**: The regional listing confirms the same public screenshot carousel and product description. The visible carousel shows the mode-selection screen, formation with player ratings, tournament bracket, Hall of Honor, post-match ratings, award, and club standings/last-next match. The extracted page text itself did not add Versus-specific details.

## Research conclusion after expanded search

Across the public App Store, MWM screenshot annotations, NamuWiki, multiple YouTube walkthrough pages, and frame-aware analysis of two videos, the **three-mode entry point is directly observable**, while a full Versus lobby or Versus battle-management screen is not. Therefore, an “identical” implementation can confidently match the product's observable UX language and rhythm—vertical/menu-first navigation, central next-match action, formation/rating preparation, fast simulation, results, standings, rewards—but cannot truthfully reproduce unknown Versus-specific screens without inventing them. Any remaining unknowns are explicitly marked `PUBLIC_COMMUNITY` or `RECOVERY_INFERRED`.

## Versus-specific community evidence

10. **TapTap official/community forum page**: The public page confirms an official game community and exposes a post stream, but the selected page returned only navigation and a visible community feed; no complete Versus UI walkthrough was available in extracted text. Search metadata referenced public discussion about 对战 mode and permanently locking high-rated players with coins, which suggests roster/economy management around the battle mode, but those search snippets are not sufficient to establish the exact UX.
11. **Facebook official-looking public page/video**: The public video title/caption says “Player + Coach dual mode, and you can also battle friends!” (`球員+教練雙模式，還可以跟好友對戰！`). The visible page shows a 30-second vertical video and a game setup screen in the frame, but extracted page data does not expose a full Versus sequence. This is stronger evidence that friend battle is a product promise than evidence of its screen-by-screen implementation.

## Evidence classification

The evidence now supports a **friend-battle/Versus entry point** and a management-style portrait UI. It still does not expose the complete battle lobby, opponent selection, submission confirmation, asynchronous deadline, or standings flow. Those details should be implemented from the repository's recovered domain contract and clearly marked as `RECOVERY_INFERRED` until a public frame or internal specification confirms them.

## Facebook transcript/frame review

12. The Facebook page exposes a public transcript in Traditional Chinese. The transcript discusses a dream of MVP, championship, Golden Boot, honors, fans, and top-club contracts, then returning to training and attributes. It does not describe the friend-battle screens. A visible frame during transcript review shows a portrait game screen with a signing-success overlay, club crest, a `Next Week` control, and a persistent bottom navigation bar. This reinforces the management-first, portrait, interruption-and-next-action rhythm, but it is not evidence of the Versus battle UI.

The expanded evidence still yields no public frame of the full Versus lobby or battle configuration. The implementation can match the public product shell and interaction rhythm closely, but any claim that the exact internal Versus screens are identical would require direct evidence not currently available publicly.

## Changelog and strategy evidence

13. **Chinese App Store regional listing search result**: The public changelog snippet for the game includes `对战模式新增分组码功能` (Versus mode added group-code functionality) and `对战模式新增高级球探功能` (Versus mode added an advanced scout feature). This directly supports a group-code entry flow and a Versus-specific scouting/roster acquisition surface. The browser-rendered regional page currently exposed only the latest 2.8.0 bug-fix note, so the older changelog wording is retained as search-result evidence and should be treated as public listing evidence rather than recovered server configuration.
14. **7723 community strategy search result**: The public search snippet says to open 对战 mode and `报名参加比赛` (register/sign up to participate in a competition). The article itself was blocked by a slider verification page, so the registration wording is useful but the rest of the article was not relied on.

## UX consequence

The current Discord UX should add a distinct **Register/Enroll** state before a battle is active, keep the **group code** prominent in Versus Home, and reserve a future **Scout/Recruit** surface for Versus roster acquisition. The existing `/versus-join group_code:<code>` maps well to the group-code evidence, while `/versus-roster` and the lineup builder cover the currently recovered roster layer. Do not present advanced scouting as implemented until its economy and roster rules are recovered or explicitly designed.

## YouTube search refinement

15. A YouTube search for `足球 巨星崛起 对战模式` returned mostly unrelated football content and one relevant player-career video titled `足球：巨星崛起］成為最强的前锋只需要點射門就可以了！！！`. No clearly indexed public YouTube video showing the game's full 对战/Versus flow appeared in the extracted result page. This negative result is important: searching the Chinese mode name did not produce verifiable screen-by-screen Versus evidence, so implementation should not invent a hidden original UI.

The strongest Versus-specific public clues remain the App Store changelog snippets about group codes and advanced scouting, the public friend-battle promotion, and community strategy wording about registering for a competition. These justify a group-code + registration + roster/scouting UX direction, but not an exact pixel-level layout.

## Advanced scout and player-status evidence

16. A Chinese App Store search result provides a more complete changelog for the battle mode: `對戰模式新增分組碼功能` (added group-code feature), `對戰模式新增高級球探功能` (added advanced scout feature), and `對戰模式新增提升球員狀態功能` (added a player-status improvement feature), followed by bug fixes and experience optimization. The same wording appears across regional App Store results and an English Cameroon listing snippet as “Add advanced scout function in battle mode” and “Add function to improve player status in battle mode.” This is strong public product evidence that the original battle mode includes group entry, scouting, and a player-status enhancement surface. It does not reveal the exact buttons, costs, formulas, or screen order.

17. The Douyin search result `足球巨星崛起对战模式怎么刷高分球员` (how to farm high-rated players in battle mode) and the TapTap snippet about permanently locking high-rated players with coins reinforce that battle-mode UX includes roster acquisition/retention and economy decisions. These sources are community/search evidence, not official rules documentation.

## Client recovery asset review

18. The user-provided client recovery contains named `NextMatchBack`, `NextMatchBack2`, and `NextMatchBack3_*` texture/sprite assets, plus `img_rank_btn`, `img_160mvp`, `ClubIcon`, and many `champleague_*` assets. Direct visual review of `NextMatchBack_1.png` shows a wide blue/white/red next-match panel background; `NextMatchBack2_1.png` shows a football icon panel. These assets confirm a visual hierarchy centered on next match and club/match identity, but they do not identify a dedicated Versus screen. The assets remain read-only forensic input and are not copied into the Discord repository because the delivery policy excludes proprietary client archives/assets.

19. A passive UTF-16 string scan across the raw Unity data found no reliably extractable occurrences of the Chinese battle/scout/group labels (`对战`, `分组`, `球探`, `报名`, `好友`, `阵容`, and related terms). This is a negative recovery result, not evidence that the features do not exist; it means the current recovery artifacts do not provide text strings that can safely reconstruct the screen. The dedicated scan output is preserved in `docs/VERSUS_UX_RECOVERY_UTF16_SCAN.txt`.
