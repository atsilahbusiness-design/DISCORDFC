# Follow-up Gameplay Parity Matrix — 2026-08-22

## Scope

Riset lanjutan ini menilai ulang gameplay Football Rising Star terhadap DISCORDFC dengan prinsip evidence-first. Official store listings establish the high-level Player/Coach loop, the public Facebook promotion establishes friend battle positioning, the regional App Store changelog confirms battle-mode group code, advanced Scout, and player-status improvement, while the two verified YouTube sources expose the most useful Versus navigation and screen sequence.[1] [2] [3] [4] [5]

The public record still does not expose complete server-side formulas. Therefore, the implementation distinguishes `WALKTHROUGH_OBSERVED`, `PUBLIC_OFFICIAL`, `PUBLIC_COMMUNITY`, `RECOVERY_VERIFIED`, and `RECOVERY_INFERRED` rather than converting every visible label into an invented mechanic.

## Mode comparison

| Mode | Public gameplay signal | DISCORDFC status | Remaining parity risk | Safe next action |
|---|---|---|---|---|
| Player | Fifteen-year-old start, long career, training, competitions, transfers, skills, trophies, and fast simulation are described by official listings. | Detailed skills, weekly progression, match, EXP allocation, injury, trainer, culture, tricks, events, awards, retirement, and rebirth exist. | Exact career cadence, event catalogue, economy, and numeric match formula are not fully public. | Calibrate only against authoritative config or golden observations; keep current inferred provenance. |
| Coach | Official listings emphasize retired-star start, managing clubs, changing formations, flexible tactics, and pursuit of trophies. | Separate Coach aggregate, roster/club state, home-away season, full projected standings, board targets, approval, jobs/events, Champions League, retirement, and rebirth exist. | Opponent AI, staff effects, transfers, budgets, and formula coefficients remain inferred. | Add recovered opponent/staff inputs only when verified; do not merge Coach state into Player. |
| Versus | Dedicated walkthrough shows mode selection, a country/logo/name setup screen, dashboard resources, registration, Deal auction, Scout, lineup, tactics, sponsor, rewards, and rankings. Review confirms dashboard, preview, market, sponsor, rewards, club detail, schedule, and global ranking. Community evidence confirms a system market and timed competition state. | System-managed matchmaking/assignment abstraction, multi-club home/away season, group code fallback, registration state, owner-bound Home, pre-match builder, legal XI, captain/substitutes, deadline/version guards, two-half settlement, standings, rewards, ledger, schedule, ranking surfaces, and Deal bid mutation exist. Internal `VersusClub` remains a recovery aggregate, not a claim that the user creates a canonical club. | Exact matchmaking queue/MMR, Scout offers/effects, Sponsor payout/cooldown, diamond shop, status boosts, live/server ranking, and original formulas remain unverified. | Keep system assignment transparent; calibrate exact queue and unsupported economy mechanics only from controlled evidence. |

## Implemented follow-up change

The highest-confidence correction is to remove the user-facing club-creation concept. The walkthrough visibly shows country, crest/logo, and club-name setup before the Versus dashboard, but it does not establish whether that identity is user-owned, system-generated, or a private-group label.[4] Community evidence instead shows a system-managed Versus market and a timed competition state.[6] DISCORDFC therefore now performs assignment automatically when the user opens `/versus-profile` or the Versus Home button, and retains `/versus-join group_code:<code>` only as a private-group fallback. The internal `VersusClub` aggregate remains because recovery exposes club-based standings and battle payloads, but the Discord UX calls it an assigned team.

The matchmaking implementation is intentionally a transparent `RECOVERY_INFERRED` assignment abstraction. It does not claim the original MMR, queue duration, opponent selection, or server-global matching algorithm. Deal now supports inferred but server-authoritative-in-our-domain listing snapshots, coin reservation, outbid release, countdown expiry, settlement, roster transfer, and idempotent ledger events. Scout, Sponsor, diamond, and status mechanics remain non-mutating because their rules are not recovered.

## Evidence-driven implementation policy

| Feature visible in public evidence | Current treatment | Reason |
|---|---|---|
| Group code and competition registration | Functional | Public changelog and community/product surfaces support the existence of the flow. |
| System-managed team identity/assignment | Functional through matchmaking abstraction | The setup screen is observed, but ownership semantics are disputed; assignment is therefore system-managed and labeled `RECOVERY_INFERRED`. |
| Deal auction | Functional under versioned inferred ruleset | Listing snapshots, minimum bid, coin reservation, `BID_RELEASED`, countdown expiry, escrow-style settlement, roster transfer, and idempotent ledger are implemented; original pricing and timing remain unverified. |
| Advanced Scout | Read-only preview | Feature is confirmed by changelog, but offer generation, price, cooldown, and acquisition effect are unknown. |
| Player-status improvement | Not mutating | Existence is confirmed, but cost, duration, and effect formula are unknown. |
| Sponsor tiers | Read-only preview | Tiers are visible, but payout/cooldown and claim semantics are not recovered. |
| Rankings | Functional where telemetry exists | Club standings and goals/assists can use local season telemetry; goalkeeper metrics are explicitly unavailable. |
| Global Ranking | Season-wide projection | A cross-season server-global repository is not present, so the scope is labeled transparently. |
| Match preview | Functional inferred estimate | Attack/defence and rating are useful UI signals but remain `RECOVERY_INFERRED`. |

## Verification target

After this change, the repository should pass TypeScript build, all regression tests, targeted audit, production dependency audit, and diff checks. The current regression count is 57 tests. Passing tests establish internal correctness and isolation; they do not prove pixel parity or original server formula parity.

## References

[1]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play listing"

[2]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store listing"

[3]: https://apps.apple.com/mo/app/%E8%B6%B3%E7%90%83-%E5%B7%A8%E6%98%9F%E5%B4%9B%E8%B5%B7/id1585604439 "Football Rising Star — regional Mandarin App Store listing"

[4]: https://www.youtube.com/watch?v=V8MsDUXNl8A "Footy Star Versus Mode — No Commentary — Day1"

[5]: https://www.youtube.com/watch?v=KQiUcv9d25c "Football Rising Star review — Android game, 2021"

[6]: https://www.taptap.cn/moment/362746078098883195?group_id=306994 "TapTap community battle-mode market walkthrough"
