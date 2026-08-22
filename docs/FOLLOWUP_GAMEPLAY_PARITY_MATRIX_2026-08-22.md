# Follow-up Gameplay Parity Matrix — 2026-08-22

## Scope

Riset lanjutan ini menilai ulang gameplay Football Rising Star terhadap DISCORDFC dengan prinsip evidence-first. Official store listings establish the high-level Player/Coach loop, the public Facebook promotion establishes friend battle positioning, the regional App Store changelog confirms battle-mode group code, advanced Scout, and player-status improvement, while the two verified YouTube sources expose the most useful Versus navigation and screen sequence.[1] [2] [3] [4] [5]

The public record still does not expose complete server-side formulas. Therefore, the implementation distinguishes `WALKTHROUGH_OBSERVED`, `PUBLIC_OFFICIAL`, `PUBLIC_COMMUNITY`, `RECOVERY_VERIFIED`, and `RECOVERY_INFERRED` rather than converting every visible label into an invented mechanic.

## Mode comparison

| Mode | Public gameplay signal | DISCORDFC status | Remaining parity risk | Safe next action |
|---|---|---|---|---|
| Player | Fifteen-year-old start, long career, training, competitions, transfers, skills, trophies, and fast simulation are described by official listings. | Detailed skills, weekly progression, match, EXP allocation, injury, trainer, culture, tricks, events, awards, retirement, and rebirth exist. | Exact career cadence, event catalogue, economy, and numeric match formula are not fully public. | Calibrate only against authoritative config or golden observations; keep current inferred provenance. |
| Coach | Official listings emphasize retired-star start, managing clubs, changing formations, flexible tactics, and pursuit of trophies. | Separate Coach aggregate, roster/club state, home-away season, full projected standings, board targets, approval, jobs/events, Champions League, retirement, and rebirth exist. | Opponent AI, staff effects, transfers, budgets, and formula coefficients remain inferred. | Add recovered opponent/staff inputs only when verified; do not merge Coach state into Player. |
| Versus | Dedicated walkthrough shows mode selection, club creation, dashboard resources, registration, Deal auction, Scout, lineup, tactics, sponsor, rewards, and rankings. Review confirms dashboard, preview, market, sponsor, rewards, club detail, schedule, and global ranking. | Multi-club home/away season, group code, registration state, owner-bound Home, pre-match builder, legal XI, captain/substitutes, deadline/version guards, two-half settlement, standings, rewards, ledger, schedule, ranking surfaces, and symbolic club identity setup exist. | Exact auction bids, Scout offers/effects, Sponsor payout/cooldown, diamond shop, status boosts, live/server ranking, and original formulas remain unverified. | Continue with visual/onboarding fidelity and read-only surfaces until rules are recovered; implement mutation only with cost/effect/persistence evidence. |

## Implemented follow-up change

The highest-confidence missing UX element was first-time Versus club creation. The verified walkthrough visibly shows country, crest/logo, and club-name choices before the dashboard.[4] DISCORDFC now provides `/versus-club name:<name> country:<code> crest:<symbolic-key>` and an owner-bound Discord modal reachable from the mode dashboard. The domain validates all three fields and permits identity configuration only while the Versus club is still `IDLE`, before group enrollment or an active season. The crest is a symbolic key rendered as text; no proprietary texture, binary, or recovered artwork is shipped.

The change is deliberately separate from Player and Coach state. It does not spend money, alter the roster, create a fake auction, or claim that country/crest identifiers match the original server catalog. Once a club is enrolled, the identity becomes immutable for the active lifecycle so that shared season snapshots cannot be changed behind other participants.

## Evidence-driven implementation policy

| Feature visible in public evidence | Current treatment | Reason |
|---|---|---|
| Group code and competition registration | Functional | Public changelog and community/product surfaces support the existence of the flow. |
| Club identity creation | Functional before enrollment | Screen sequence is directly observed; exact backend IDs remain abstracted. |
| Deal auction | Read-only preview | Listing, bid, countdown, and transaction screens are observed, but bid economics and persistence are not fully recovered. |
| Advanced Scout | Read-only preview | Feature is confirmed by changelog, but offer generation, price, cooldown, and acquisition effect are unknown. |
| Player-status improvement | Not mutating | Existence is confirmed, but cost, duration, and effect formula are unknown. |
| Sponsor tiers | Read-only preview | Tiers are visible, but payout/cooldown and claim semantics are not recovered. |
| Rankings | Functional where telemetry exists | Club standings and goals/assists can use local season telemetry; goalkeeper metrics are explicitly unavailable. |
| Global Ranking | Season-wide projection | A cross-season server-global repository is not present, so the scope is labeled transparently. |
| Match preview | Functional inferred estimate | Attack/defence and rating are useful UI signals but remain `RECOVERY_INFERRED`. |

## Verification target

After this change, the repository should pass TypeScript build, all regression tests, targeted audit, production dependency audit, and diff checks. The expected regression count is 44 tests. Passing tests establish internal correctness and isolation; they do not prove pixel parity or original server formula parity.

## References

[1]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play listing"

[2]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store listing"

[3]: https://apps.apple.com/mo/app/%E8%B6%B3%E7%90%83-%E5%B7%A8%E6%98%9F%E5%B4%9B%E8%B5%B7/id1585604439 "Football Rising Star — regional Mandarin App Store listing"

[4]: https://www.youtube.com/watch?v=V8MsDUXNl8A "Footy Star Versus Mode — No Commentary — Day1"

[5]: https://www.youtube.com/watch?v=KQiUcv9d25c "Football Rising Star review — Android game, 2021"

[6]: https://www.facebook.com/100071929744255/videos/%E8%B6%B3%E7%90%83%E5%A4%A9%E6%89%8D/2416609028674860/ "Football Rising Star official Facebook promotion"
