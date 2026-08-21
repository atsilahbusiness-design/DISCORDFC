# Gameplay Expansion Design

**Status:** Ready for implementation
**Scope:** Player-mode vertical slice plus compatible Coach-mode boundaries
**Formula provenance:** Every numeric rule in this document is `RECOVERY_INFERRED` unless explicitly marked otherwise.

## Design principles

The implementation keeps the domain engine free of Discord and database imports. It uses additive optional profile fields so existing profiles remain readable. All domain functions clone their input, validate preconditions, apply deterministic state changes, and return a result object suitable for the current optimistic-concurrency store.

The canonical time unit is one **career week**. The new `advanceWeek` function owns the transition. Training and study commands prepare state for the transition; the transition settles pending actions, applies passive effects, processes an eligible fixture, produces unassigned match EXP, resolves annual awards, and advances the calendar exactly once.

## Detailed skill model

The twelve detailed skills are stable identifiers with user-facing labels. Macro stats remain in `PlayerStats` for backwards compatibility and are derived from detailed skills at mutation boundaries.

| ID | Label | Primary gameplay signal |
|---|---|---|
| `shots` | Shots | Finishing and goal conversion. |
| `penalty` | Penalty | Penalty conversion and composure. |
| `header` | Header | Aerial finishing and defensive aerial actions. |
| `pass` | Pass | Chance creation and possession quality. |
| `dribbling` | Dribbling | Ball progression and chance creation. |
| `freeKick` | Free Kick | Set-piece threat. |
| `offBallRunning` | Off-ball Running | Space creation and chance quality. |
| `holdOffDefenders` | Hold Off Defenders | Physical protection and duel resistance. |
| `teamwork` | Teamwork | Assist contribution and team chemistry. |
| `endurance` | Endurance | Energy preservation and weekly availability. |
| `speed` | Speed | Transition, separation, and recovery. |
| `willpower` | Willpower | Form stability, injury resilience, and difficult-event outcomes. |

The detailed skills begin from deterministic position presets and legacy macro values. A `deriveMacroStats` function maps detailed skills to the six existing macro attributes. The initial mapping is deliberately transparent and centrally tested; it is not claimed to be the original formula.

## Weekly transition

The profile gains `careerYear`, `careerWeek`, `seasonWeek`, `pendingMatchExp`, `injury`, `activeTraining`, `activeTrainer`, `cultureStudy`, `tricks`, `honors`, `worldFootballer`, `retirement`, and `rebirthCount` fields. A weekly transition returns a `WeekResult` containing events, fixture/match result, EXP awaiting allocation, injury changes, award changes, and the new profile.

`advanceWeek` rejects a retired profile, rejects a profile with an unresolved pending match EXP allocation when the next match would produce a new pool, settles completed training, applies trainer and culture effects, decrements injury, simulates the scheduled player match if available, and then increments `careerWeek`. The operation is deterministic under a supplied `RandomSource` and safe to retry at the store layer through the existing version check.

## Training, tricks, trainers, and culture

Immediate detailed training grants a bounded amount of skill EXP and consumes energy. Trick training requires a definition and all prerequisites, then marks the trick as unlocked. Personal trainers have a type, weekly ratio, weekly cost, and active-until week. Culture study has one active subject at a time, a fixed duration, and a small charm/effect result at settlement.

The first catalog includes one observed trick, Bicycle Kick, with conservative prerequisites. Additional entries can be added without changing the domain API. Trainer tiers are Junior, Senior, and Expert because those tiers are visible in the walkthrough; their exact ratios are `RECOVERY_INFERRED`.

## Injury and treatment

Injury is a bounded state with `severity`, `weeksRemaining`, `source`, and `treatmentUsed`. A match may trigger an injury based on position and condition. The first implementation uses one-to-six-week durations and a basic treatment that removes one week plus an expert treatment that removes up to three weeks for a money cost. These are transparent Discord-friendly substitutes, not claims about the original monetization flow.

## Honors and World Footballer

Honors are immutable records with `category` (`PERSONAL`, `TEAM`, `NATIONAL`), title, season, source, and value. The annual award stores the season, winner, candidate score, and whether the user won. The first candidate comparison uses the user’s season score and career contributions against deterministic simulated candidates. It is a progression loop, not a claim of original server logic.

## Retirement and rebirth

Retirement is triggered at the configured age boundary of 34, consistent with community evidence [1]. The profile keeps its historical record and changes to `RETIRED`. Rebirth is available only after retirement, preserves money, starts the new career at level 10, increments `rebirthCount`, resets season/weekly state, and preserves honors. The preservation and starting-level behavior follows community evidence [1]; all other mechanics are `RECOVERY_INFERRED`.

## Command surface

| Command | Behavior |
|---|---|
| `/skills` | Display detailed skills, macro summaries, pending EXP, active training, trainer, culture, tricks, and injury state. |
| `/train-skill skill:<id>` | Spend energy on one detailed skill. |
| `/assign-exp skill:<id> amount:<n>` | Allocate pending match EXP manually; repeat until the pool is empty. |
| `/next-week` | Advance the canonical weekly loop and return an event-rich summary. |
| `/injury action:view|basic-treatment|expert-treatment` | View or treat injury. |
| `/trick action:list|train` and `trick_id` | View and unlock tricks. |
| `/trainer action:list|hire|release` and `trainer_id` | View or manage personal trainers. |
| `/culture subject:science|arts|history` | Begin a culture study. |
| `/honors` | View Hall of Honor categories and records. |
| `/world-footballer` | View the current annual award result or candidate state. |
| `/retire` | Confirm retirement when eligible. |
| `/rebirth` | Start a new career after retirement. |

Existing `/train` and `/match` remain available during migration. Their handlers should call the new domain functions or clearly mark the legacy path; they must not silently create divergent weekly state.

## Test contract

Tests must cover profile migration, detailed skill level-up, manual EXP allocation, training prerequisites, trick unlock, trainer weekly gain, culture settlement, injury blocking/treatment, idempotent week transition at the domain boundary, annual award uniqueness, retirement boundary, rebirth preservation, and legacy command compatibility.

## References

[1]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80 "NamuWiki — Football: Rising Star"
