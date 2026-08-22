# Overnight parity research — 2026-08-23

## Public evidence checked

The official Macau App Store listing for 足球：巨星崛起 states that Player Mode starts with a 15-year-old talent joining a professional club, then continues for 20 years through matches, training, transfers, and football tricks. It also describes Coach Mode separately and calls the game a light simulation without cumbersome controls. The same listing exposes diamond in-app purchase tiers, but it does not disclose the gameplay exchange rate, cooldown, or server formula: https://apps.apple.com/mo/app/%E8%B6%B3%E7%90%83-%E5%B7%A8%E6%98%9F%E5%B4%9B%E8%B5%B7/id1585604439.

The official Google Play listing describes the same Player/Coach framing and should be treated as public official product evidence, not numeric formula evidence: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US.

The dedicated Versus walkthrough remains the strongest visual evidence for the battle surface: https://www.youtube.com/watch?v=V8MsDUXNl8A. It shows a country/logo/name setup screen, dashboard resources, registration, Deal market, Scout, pitch/lineup, formation, tactics, sponsors, rewards, and rankings. The footage does not prove whether the identity is user-created, system-assigned, or private-group metadata.

TapTap community evidence confirms that the battle mode has a coin market with bid behavior, and that market state had a short persistence/countdown window in the observed 2023 guide: https://www.taptap.cn/moment/362746078098883195?group_id=306994. The guide also describes save-copy manipulation. This is untrusted community content and must not be implemented as an exploit; only the existence of a market/bid surface is useful evidence.

## Engineering implications

Player numeric coefficients remain unverified. Continue using centralized versioned formula functions, deterministic replay, and probe-only calibration rather than promoting synthetic values to official parity.

Versus Deal is safe to model as server-authoritative listing snapshots, countdown, minimum bid, reservation, outbid release, expiry, and idempotent settlement. Exact auction timings, currency rates, and matchmaking algorithm remain `RECOVERY_INFERRED` until direct controlled observations become available.

The previous claim that the user creates a canonical Versus Club remains withdrawn. Public evidence supports a system-managed battle/competition abstraction more strongly than a user-owned club claim, while the internal `VersusClub` aggregate remains an implementation detail for roster/standings compatibility.
