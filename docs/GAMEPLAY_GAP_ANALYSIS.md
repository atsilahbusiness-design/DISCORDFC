# Gameplay Gap Analysis and Expansion Contract

**Project:** DISCORDFC — Football Rising Star Discord bot
**Author:** Manus AI
**Date:** 2026-08-21
**Evidence policy:** Field existence and UI behavior are separated from unverified numeric formulas. All newly introduced balance rules are marked `RECOVERY_INFERRED` unless directly supported by public product copy or recovery signatures.

## Executive assessment

The bot already has a strong persistence, competition, market, contract, and club-management foundation, but its career loop is still **match-command driven** and its player model is still **macro-ability driven**. The public product descriptions establish Player and Coach modes, a player career beginning at age 15, a long career horizon, training, transfers, formation, and tactics [1] [2]. The walkthrough adds observable details such as detailed skill training, manual post-match EXP assignment, trick training, personal trainers, culture study, injury treatment, weekly progression, Hall of Honor, and an annual World Footballer event [3]. Recovery signatures independently confirm structured support for position ratios, separate routine and skill training, trainer catalogs, age-gated player and coach events, honor conditions, round scheduling, and season cooldown state [4].

The expansion should therefore preserve the existing domain/application/Discord separation while introducing an explicit **weekly career state machine**. A match may remain available as a convenience command, but the canonical player loop should be: inspect current week, train or study, resolve event, advance week, simulate a scheduled match when present, receive assignable EXP, allocate EXP manually, and apply injury/recovery/award outcomes.

## Evidence and confidence levels

| Evidence class | What it supports | What it does not support |
|---|---|---|
| Official store descriptions | The existence of Player and Coach modes, age 15 onboarding, long career framing, training, transfers, formations, and tactics [1] [2]. | Exact formulas, costs, level caps, injury probabilities, event content, or live-service timing. |
| Public walkthrough analysis | Observable UI flow and named gameplay concepts, including detailed skills, manual EXP assignment, trick training, trainers, culture study, injury treatment, weekly progression, honor, and World Footballer [3]. | Server-side implementation, exact effect values, or whether every observed item exists in every client version. |
| Recovery class signatures | Concrete field names and separate configuration/state models, including `PositionConfig`, `RoutineTrainConfig`, `SkillTrainConfig`, `PersonalTrainerConfig`, event configs, `HonorConfig`, `RoundConfig`, `SeasonCDConfig`, and save-state fields [4]. | Numeric payload values for encrypted/obfuscated assets when the decryption method body is unavailable. |
| Existing bot code | Current persistence and command behavior in `types.ts`, `engine.ts`, `progression-engine.ts`, `competition-engine.ts`, and Discord handlers. | Parity with the original product. Existing formulas remain bot-specific unless separately evidenced. |

## Current implementation versus target behavior

| Capability | Current bot | Target contract | Priority |
|---|---|---|---|
| Player onboarding | Starts at age 18 with six macro abilities. | Start at age 15 with detailed skills, derived macro attributes, initial position profile, and a 20-year career horizon. | P0 |
| Detailed skills | `atk`, `def`, `speed`, `power`, `strength`, `technique` are directly trained. | Store 12 detailed skills: Shots, Penalty, Header, Pass, Dribbling, Free Kick, Off-ball Running, Hold Off Defenders, Teamwork, Endurance, Speed, and Willpower. Macro attributes become derived summaries. | P0 |
| Time | Actions use wall-clock recovery; league advances only after `/match` and resets after ten matchdays. | Add a canonical `careerWeek`, season week, scheduled fixture reference, pending actions, and idempotent `/next-week`. | P0 |
| Training | One immediate energy-cost action grants random EXP to one macro ability. | Support routine training, detailed skill training, prerequisites, HP/energy costs, pending training duration, and manual EXP allocation after matches. | P0 |
| Match EXP | Match reward EXP is added to `totalExp` only. | Emit `unassignedMatchExp` with match performance metadata; require `/assign-exp` or a component allocation before detailed skill levels change. | P0 |
| Injury | Career stat has an injury counter, but no injury state or treatment. | Injury has status, source, weeks remaining, severity, treatment options, and a hard rule preventing match participation while unavailable. | P0 |
| Recovery | Passive hourly HP and energy recovery only. | Preserve passive recovery, add weekly rest/recovery, treatment, and injury-aware progression. | P0 |
| Trick training | Absent. | Data-driven trick definitions with detailed-skill prerequisites, unlock status, and match modifiers. Bicycle Kick is an observed example, not proof of the full catalog. | P1 |
| Personal trainers | Absent. | Player and Coach trainer catalogs with type, ratio, weekly cost, active contract, and passive weekly application. | P1 |
| Culture study | Absent. | Science, Arts, and History studies with charm and controlled attribute effects. Exact effect values are `RECOVERY_INFERRED`. | P1 |
| Events | One hard-coded daily event with money/EXP/morale fields. | Age-gated, data-driven, multi-choice events with typed cost/reward lists, energy and ability effects, cooldown/trigger state, and separate Coach catalog. | P1 |
| Hall of Honor | Achievement list only. | Persistent trophy records with Personal, Team, and National categories, conditions, titles, claims, and historical season metadata. | P1 |
| World Footballer | Absent. | Annual candidate comparison and award resolution based on season performance, with deterministic tie-breaks and a record in honors. | P1 |
| Contracts | Basic active/expired/sign/renew flow. | Add squad rank, club feeling, negotiation outcomes, contract start/end, salary, transfer history, and week-aware expiration. | P1 |
| Retirement | Absent. | Automatic retirement boundary around age 34, final career summary, honor snapshot, and no accidental loss of history. | P0 |
| Rebirth | Absent. | Explicit rebirth action after retirement, preserve money according to a documented rule, start at level 10 as a recovery/community-supported behavior, increment rebirth count, and retain historical honors. | P1 |
| Coach mode | Club formation/tactics exist, but no separate career identity or Coach event/honor/trainer loop. | Introduce a Coach profile mode that shares club primitives but has distinct Coach events, trainer configs, honors, season state, and objectives. | P1 |

## Gameplay expansion contract

### Player profile invariants

A profile must always contain a valid `mode`, `age`, `careerYear`, `season`, and `week`. Player detailed skills must be represented as a closed set of twelve stable identifiers. Each skill has a non-negative level and EXP, and no command may mutate a skill beyond the configured level cap. Macro attributes may be retained for compatibility and display, but they must be recalculated from detailed skills rather than independently drifting.

An injured player must have an explicit injury object or no injury object. A player with `weeksRemaining > 0` cannot play a player match, cannot be selected as an active club player, and cannot advance to a negative duration. Treatment must be idempotent and must record its cost and effect. These are domain invariants, not UI conventions.

### Weekly state machine

`/next-week` is the only command that advances the canonical career week. It must be safe to retry: a duplicate request with the same persisted version must either return the already-computed result or fail with a concurrency conflict, never apply rewards twice. The transition order is fixed: settle pending training; apply trainer and recovery effects; decrement injury; generate or resolve scheduled event state; play or schedule the week’s fixture; calculate performance and unassigned EXP; resolve season boundaries and annual awards; then increment week and persist one new version.

Direct `/match` remains backwards compatible during migration, but it should either call the same domain transition or be clearly marked as a legacy convenience action. It must not create a second time model.

### Training and EXP

Immediate routine training consumes configured energy and produces routine EXP. Skill/trick training may consume HP, energy, time, or money depending on the definition. A match produces `unassignedMatchExp`, not direct detailed-skill levels. `/assign-exp` accepts a non-empty map of skill IDs to integer EXP allocations whose sum is no greater than the pending pool. Repeated assignment against an empty pool must be rejected without mutation. Level-up processing uses a centralized curve and preserves excess EXP.

The first implementation may use a small local catalog of detailed skills and tricks while preserving a loader boundary for future decoded client payloads. The catalog must include provenance fields such as `source: 'WALKTHROUGH_OBSERVED' | 'RECOVERY_VERIFIED' | 'RECOVERY_INFERRED'`.

### Injury and treatment

Injury generation uses position-specific ratios from the recovery schema as a directional input, with the actual chance labeled `RECOVERY_INFERRED`. Severity must produce a bounded duration of one to six weeks, matching the public community report [5] and the walkthrough’s treatment flow [3]. Treatment choices should include at minimum a basic treatment that reduces duration or restores availability over time and an expert treatment path that may cost premium currency. Because Discord has no advertisements, the bot should use transparent in-game currency or cooldown alternatives rather than pretending to reproduce ad rewards.

### Awards and honors

A Hall of Honor record is immutable historical data after it is awarded. Categories must distinguish Personal, Team, and National achievements, even if National competition is initially represented by a controlled simulated event. The annual World Footballer flow evaluates a candidate pool, stores ranking/candidate metadata, records the winner, and awards the user only when the user meets the configured performance threshold. The user must be able to inspect both earned and in-progress honors.

### Coach-mode boundary

Coach mode should share club, fixture, formation, tactic, market, and persistence primitives but must not silently reuse Player-only age, detailed-skill, injury, or event assumptions. Coach configuration evidence includes separate Coach ability, formation, tactic, trainer, event, honor, round, and season classes [4]. This justifies a mode discriminator and separate rule adapters before deeper Coach parity is attempted.

## Migration and compatibility rules

The schema migration must be additive. Existing profiles with six abilities are upgraded by deriving twelve detailed skills from position and existing macro stats using a documented deterministic mapping. The mapping is not claimed to match the original game and must be labeled `RECOVERY_INFERRED`. Existing `totalExp`, contracts, market listings, club state, achievements, and ledger entries must remain readable. New optional fields should default to a valid pre-injury, zero-pending-EXP, week-one state.

Every domain mutation must continue to use clone-before-mutate semantics and must be persisted through the existing optimistic-concurrency store. The Discord adapter must never own gameplay formulas. New command handlers should call pure domain functions and present domain result objects through embeds/components.

## Definition of done for this expansion

| Area | Acceptance condition |
|---|---|
| State | Existing JSON and PostgreSQL profiles migrate without losing money, club, contract, market, or achievement data. |
| Skills | Twelve detailed skills can be viewed, trained, leveled, and allocated from match EXP; macro attributes remain coherent. |
| Time | `/next-week` advances exactly one week, is idempotent under retry, and can trigger training settlement, event, match, injury, and award outcomes. |
| Injury | Injury blocks participation, exposes treatment, decrements correctly, and records recovery. |
| Progression | Player can reach retirement boundary, view a final summary, and perform rebirth with preserved historical honors. |
| Honors | Personal, Team, and National records can be earned, viewed, and remain immutable. Annual World Footballer can resolve once per season. |
| Discord UX | New slash commands and components expose all P0 features without requiring raw JSON or internal IDs that are not shown to the user. |
| Quality | Existing tests remain green, new deterministic tests cover every new domain transition, and balance snapshot documents every `RECOVERY_INFERRED` knob. |
| Provenance | No Discord/database secrets, proprietary binary, or unverified claim of 1:1 parity is committed. |

## References

[1]: https://apps.apple.com/us/app/football-rising-star/id1585604439 "Football Rising Star — Apple App Store"

[2]: https://play.google.com/store/apps/details?id=com.babuyo.footy.tc.android&hl=en_US "Football Rising Star — Google Play"

[3]: https://www.youtube.com/watch?v=sS5T8E43LQI "Football Rising Star — Gameplay Walkthrough Part 1"

[4]: https://github.com/atsilahbusiness-design/DISCORDFC/blob/main/docs/recovery_gameplay_config_signatures.txt "DISCORDFC recovery gameplay config signatures"

[5]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "NamuWiki — Football: Rising Star"
