# Player Mode — Video Research Report

**Status:** Video-observed gameplay synthesis  
**Tanggal:** 2026-08-22  
**Analisis:** 20 playlist entries processed; the playlist extraction contains one duplicated video ID, so the batch represents 20 analysis runs and 19 unique video IDs. Additional Coach/overview videos were analyzed separately.  
**Provenance rule:** Directly visible behavior is `VIDEO_OBSERVED`; numeric formulas, hidden thresholds, and backend behavior remain `RECOVERY_INFERRED` unless independently verified.

## Executive conclusion

Player Mode is a **menu-driven, weekly career simulation** for one athlete. The player does not directly control actions on the pitch. The meaningful decisions happen before and after the simulated fixture: training selection, energy and injury management, event choices, contract/transfer decisions, and manual allocation of earned EXP into detailed skills. The loop is persistent across seasons and clubs, with league tables, continental competition, national-team events, awards, Hall of Honor records, retirement, and rebirth.

The repeated structure is stable across early, mid-career, elite-club, and late-career videos. The most important design implication for DISCORDFC is that Player Mode should remain a **weekly state machine**, not a button that directly resolves an isolated match.

## Reconstructed weekly loop

```text
Review dashboard and upcoming fixture
        ↓
Manage energy, injury, contract, club, and training
        ↓
Choose narrative/event response when triggered
        ↓
Press Next Week
        ↓
Automatic training and scheduled match simulation
        ↓
Match result, rating, goals/cards/injury, and rewards
        ↓
Manually assign Exp left to detailed skills
        ↓
Update league table, records, fame, contract, and awards
        ↓
Continue to next week or season transition
```

| Stage | Repeated video observation | DISCORDFC implication |
|---|---|---|
| Dashboard | Date, player profile, club, energy/health, news, upcoming fixture, and `Next Week`. | Persist `currentDate`, `currentWeek`, energy, injury, fixture, and pending actions. |
| Preparation | Regular, trick, and personal training; contract, club, and recovery screens. | Treat training and recovery as commands that mutate a versioned profile. |
| Event | Narrative choice such as culture study, teammate interaction, practice, media, or financial event. | Store an active event and resolve one choice exactly once. |
| Advance | `Next Week` triggers time, automatic training, fixture/event checks, and settlement. | Use an idempotent weekly transition with a deterministic seed. |
| Match | Simulated result, lineup/ratings, score, goals, cards, and sometimes injury. | Do not require a live opponent or real-time session in Player Mode. |
| Progression | EXP is shown after the match and assigned manually to one or more detailed skills. | Use a pending EXP ledger and explicit allocation command/component. |
| Persistence | League table, club, salary, fame, contract, records, awards, and age persist. | Save the complete profile atomically with optimistic concurrency. |

## Player identity and skills

The videos repeatedly show a player beginning around age 15, with a position such as ST and a macro profile containing PHY, OFF, DEF, TEC, STA, and SPD. The detailed progression interface exposes twelve skills:

| Skill | Evidence status |
|---|---|
| Shots | `VIDEO_OBSERVED`; detailed post-match EXP allocation. |
| Penalty | `VIDEO_OBSERVED`; detailed post-match EXP allocation. |
| Header | `VIDEO_OBSERVED`; detailed post-match EXP allocation. |
| Pass | `VIDEO_OBSERVED`; regular/event training. |
| Dribbling | `VIDEO_OBSERVED`; regular/event training. |
| Free Kick | `VIDEO_OBSERVED`; detailed post-match EXP allocation. |
| Off-ball Running | `VIDEO_OBSERVED`; detailed post-match EXP allocation. |
| Hold Off Defenders | `VIDEO_OBSERVED`; event and skill progression. |
| Teamwork | `VIDEO_OBSERVED`; social events and match progression. |
| Endurance | `VIDEO_OBSERVED`; training and social events. |
| Speed | `VIDEO_OBSERVED`; regular training and allocation. |
| Willpower | `VIDEO_OBSERVED`; detailed skill screen and progression. |

The six macro attributes are useful as display summaries and simulation inputs, but the videos support storing the twelve detailed skills as the authoritative user-facing progression layer. The exact mapping from detailed skills to macro attributes and match probability is not visible and remains `RECOVERY_INFERRED`.

## Training systems

Three training branches recur. **Regular Training** improves general football or physical categories. **Trick Training** is a longer-term unlock system for named moves such as Bicycle Kick, Jumping Kick, Scorpion Kick, Knuckle Ball, Storm Dash, Floating, Magician, or Never Give Up. Several videos show prerequisite-like behavior in which a trick becomes available after attribute conditions; the exact thresholds are not visible. **Personal Training** hires a Junior, Senior, or Expert trainer for physical or skill sessions, with diamonds or other resources sometimes accelerating duration. The client recovery separately contains Player and Coach personal-trainer schemas with `Type`, `Ratio`, and `WeekCost`, supporting a weekly passive-modifier model.

A faithful Discord implementation should therefore distinguish a training order from an instant stat mutation. A training order has a target, duration, resource cost, prerequisites, and settlement week. Completion should be idempotent and visible in the weekly report.

## Match and EXP behavior

All analyzed Player videos show simulated matches rather than direct control. A typical result exposes the final score, player ratings on a roughly 0–10 scale, goals, assists or defensive contributions, cards, and sometimes injury. EXP is then presented as **Exp left** and allocated manually to detailed skills. The player may be unavailable because of injury, low energy, or suspension; recovery and treatment are part of preparation rather than a post-hoc cosmetic feature.

The exact simulation formula cannot be recovered from video alone. The recovery dump confirms position-specific ratios for goals, assists, cards, injuries, and HP consumption, but numeric bodies and weighting remain `RECOVERY_INFERRED`. The engine should record a seed and a result ledger so a match can be audited without exposing or pretending to reproduce the original formula exactly.

## Energy, injury, and discipline

The weekly loop is gated by an energy/stamina resource. Multiple videos show energy depletion and recovery via rest or a Treat action, frequently associated with an advertisement in the original mobile game. Injuries appear as explicit screens with treatment options, including basic treatment and more expensive or faster surgery/treatment. Community evidence reports injury durations ranging from one to six weeks, but the videos do not establish every duration formula. Yellow and red cards create suspension or match unavailability.

For Discord, the gameplay should preserve the decision: continue with a depleted/injured player, rest, use treatment, or miss the fixture. It should not copy ad monetization. Replace the ad action with a transparent cooldown, money cost, or limited daily resource.

## Events and social state

Events are not decorative. The videos show choices involving culture study, teammates, club decoration, birthday interactions, meals, practice, media, financial windfalls, discipline, and meetings with famous players. Outcomes can affect detailed EXP, teamwork, endurance, stamina, club impression, fame, money, fans, or coach relationship. The client recovery confirms age-gated, data-driven event configs and separate Player/Coach event catalogs.

A proper event model requires an active event ID, available choices, costs, rewards, trigger context, and a resolved flag. Choices should be stored as immutable ledger entries so retries cannot duplicate rewards.

## Contracts, transfers, and career movement

Player videos show club offers containing league, club ranking, salary, role/position context, and contract duration. The player can request a pay increase, request a transfer, negotiate a renewal, or accept an offer. Movement occurs across several league tiers and countries, and the player's fame and salary change over time. Some videos show club/coach feedback and seasonal objectives such as avoiding relegation.

The transfer system should preserve the difference between an offer, negotiation, accepted contract, and completed move. A transfer must update club membership, contract dates, salary, fixture eligibility, and relationship state atomically. The recovery data confirms a separate `UserClubSaveData` contract lifecycle, but exact offer/acceptance formulas remain `RECOVERY_INFERRED`.

## Awards, records, retirement, and rebirth

The videos repeatedly show MVP, Golden Boot, UEFA/European Player, World Footballer, team trophies, national-team achievements, personal records, and Hall of Honor screens. Hall of Honor is visibly divided into personal, team, and national categories. Late-career footage reaches age 33 and shows retirement followed by rebirth; community evidence places forced retirement around 34 and reports that rebirth preserves money and begins at a higher starting level. The exact inheritance values are not established by the videos alone.

The Discord model should keep an append-only award/trophy record, a season statistics record, a retirement summary, and a rebirth transaction. A rebirth must not mutate the historical career; it creates a new career generation linked to the prior one.

## What Player Mode does not show

Across the 20 Player batch, there was no visible lobby, matchmaking screen, live human opponent, online roster synchronization, or real-time PvP interaction. League opponents, named real-world players, and award candidates are presented as simulation content. This negative evidence applies only to the Player videos; it does not disprove the separate Versus Mode described by the user and supported by the recovered `Versus*` subsystem.

## Confidence matrix

| System | Confidence | Reason |
|---|---|---|
| Player Mode exists and is a distinct career | High | Repeated main-menu and career observations; official store descriptions. |
| Weekly `Next Week` progression | High | Repeated across early, mid, and late-career videos. |
| Simulated rather than manually controlled matches | High | Repeated match-result UI and no direct pitch control. |
| Twelve detailed skills and manual EXP assignment | High | Repeated visible allocation screen and skill names. |
| Regular/trick/personal training branches | High | Repeated training menus and actions. |
| Injury, energy, suspension | High | Repeated visible status/recovery screens. |
| Culture/social/event choices | High | Repeated narrative event observations and recovery config. |
| Exact training, injury, reward, and match formulas | Low | Bodies and numeric thresholds are not available. `RECOVERY_INFERRED`. |
| Player Mode online multiplayer | Not supported by videos | No visible online flow in the Player batch. |

## Research corpus

The 20 Player analysis artifacts are stored under `docs/video_analysis/player/`. The playlist manifest is `docs/video_research_manifest.md`. Coach analyses are stored under `docs/video_analysis/coach/`. Recovery evidence for the separate Versus subsystem is recorded in `docs/COACH_MULTIPLAYER_RECOVERY_FINDINGS.md`.

## References

[1]: https://www.youtube.com/playlist?list=PLsfSDuKrLeQ3l_eDt6IKrcthK-L5r1h0N "Football Rising Star (Footy Star) Player career playlist"

[2]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play"

[3]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store"

[4]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "Football: Rising Star — NamuWiki"
