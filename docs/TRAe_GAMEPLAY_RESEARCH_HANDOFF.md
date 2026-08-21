# Trae A.I. Handoff — Deep Football Rising Star Gameplay Research

## Objective

Continue DISCORDFC as a Discord implementation inspired by Football Rising Star with three distinct modes: Player, Coach, and Versus. This handoff records the research completed on 2026-08-22 and prevents future implementation from conflating career and online state.

## Research completed

The agent processed **20 Player playlist analysis runs** covering early, mid-career, elite-club, late-career, retirement, and rebirth context. The playlist extraction contains one duplicated video ID, so there are 19 unique Player video IDs but 20 analysis artifacts. It also processed **six Coach/overview videos** covering new coach creation, club selection, multiple seasons, transfer market, formations/tactics, halftime adjustment, QCL, board targets, job changes, dismissal, retirement, and rebirth.

The agent then cross-referenced the video observations against public store pages, NamuWiki, payload inventory, and IL2CPP recovery signatures for Player, Coach, and Versus. Dedicated reports are stored in:

- `docs/PLAYER_MODE_VIDEO_RESEARCH.md`
- `docs/COACH_MODE_VIDEO_RESEARCH.md`
- `docs/VERSUS_MODE_RECOVERY_RESEARCH.md`
- `docs/GAMEPLAY_TRUTH_MATRIX.md`
- `docs/MULTI_MODE_GAMEPLAY_SPEC.md`
- `docs/COACH_MULTIPLAYER_RECOVERY_FINDINGS.md`
- `docs/video_research_manifest.md`
- `docs/video_analysis/player/`
- `docs/video_analysis/coach/`

## Product truth

| Mode | Canonical purpose | First implementation target |
|---|---|---|
| Player | Solo athlete career with weekly progression, 12 detailed skills, manual EXP, injury, training, events, transfer, awards, retirement, and rebirth. | Preserve and refine existing expansion. |
| Coach | Solo retired-star club-management career with six coach attributes, roster, List/Scout/Deal market, formation, tactics, staff, board target, events, QCL, job changes, dismissal, retirement, and rebirth. | Separate from Player state and complete Coach-specific lifecycle. |
| Versus | Online/group competition with separate user, club, season, battle, standings, rewards, scouting, and player condition state. | Implement asynchronous/server-synchronized group league first. |

## Recovery facts for Versus

The recovery dump contains a dedicated `VersusUser` lifecycle with login/logout, enroll/game/game-over status checks, time-change handling, and asynchronous game procedure. `VersusUserSave` persists a separate club ID, league, Versus money/coins, season IDs/maps, score and goal-difference dictionaries, played count, scout arrays, sponsor/exchange counters, and asynchronous `ProcessSeasonMatch` plus player-condition processing. `VersusSeasonConfig` contains season, league, group, grade, and group club IDs. `VersusBattleMiniData` contains battle ID, home/away IDs, scheduled time, state, goals, rewards, and embedded battle data. `VersusBattle` implements a two-half battle flow, formation/substitute calculation, result, MVP, and summaries. `VersusBattleClub` contains ball control, shots, shots-on-target, corners, cards, awards, player lists, and tactic/formation hooks. `VersusClub` contains standings, W/D/L, goal difference, player roster, and player statistics.

These signatures support a distinct group-based online mode. They do not reveal original API endpoints, authentication, encryption, server formula bodies, or whether users must be online simultaneously. Keep real-time PvP as an unverified P2 feature.

## Immediate implementation order

1. Create separate Versus aggregates and mode router without mutating Player or Coach wallets.
2. Implement group create/join by code, one club per user per group, capacity, membership validation, and NPC fallback.
3. Implement versioned Versus roster, player condition, scout state, lineup, formation, tactic, captain, and substitutes.
4. Implement immutable fixture/battle IDs with season, league, group, round, home/away, deadline, status, and locked input snapshots.
5. Implement deterministic two-half battle simulation using centralized `RECOVERY_INFERRED` parameters and a persisted seed.
6. Implement atomic idempotent settlement for both clubs, standings, rewards, player statistics, conditions, and audit ledger.
7. Add Discord commands/components: enroll, group create/join, roster, lineup, tactic, fixtures, result, standings, and admin/manual settlement.
8. Add tests for duplicate settlement, concurrent writes, stale component, wrong owner, deadline, insufficient roster, injury/suspension, reward replay, NPC fallback, and season transition.

## Important non-goals

Do not copy proprietary game binaries or hidden tokens into the repository. Do not claim original server parity. Do not implement real-time PvP merely because the word online appears in a release note. Do not use a single mutable roster for Coach and Versus. Do not settle rewards outside a transaction.

## Verification commands

```bash
cd /home/ubuntu/DISCORDFC
pnpm build
pnpm test
git diff --check
find docs/video_analysis/player -name '*.md' | wc -l
find docs/video_analysis/coach -name '*.md' | wc -l
```

## Open questions for product owner

The next implementation should confirm whether Versus matches are real-time or asynchronous, whether groups are private by code or public matchmaking, the maximum group size, the round cadence, promotion/relegation rules, whether Versus roster is independent or seeded from Coach roster, and the intended Discord economy. Until confirmed, use asynchronous group fixtures with immutable snapshots and NPC fallback.
