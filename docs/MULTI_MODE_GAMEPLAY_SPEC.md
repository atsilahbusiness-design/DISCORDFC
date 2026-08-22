# Multi-Mode Gameplay Specification

**Project:** DISCORDFC  
**Target:** Football Rising Star-inspired Discord game  
**Date:** 2026-08-22  
**Modes:** Player, Coach, Versus

## Product contract

DISCORDFC has three distinct gameplay modes. **Player Mode** is a personal athlete career. **Coach Mode** is a club-management career for a retired star. **Versus Mode** is the online/group competition layer where users compete with other user-owned clubs; the first implementation should be asynchronous or server-synchronized because that behavior is structurally supported by recovery and does not require simultaneous presence.

The modes share a Discord user identity and infrastructure but do not share mutable career state or wallets. A user may have one active Player profile, one Coach career, and one Versus club per configured competition scope. Historical records are append-only and cannot be rewritten by a later mode action.

## Mode boundaries

| Mode | Primary user fantasy | State owner | Time model | Match interaction |
|---|---|---|---|---|
| Player | Become a football star. | `PlayerCareer` | Weekly `Next Week`. | Simulated fixture; prepare and assign EXP afterward. |
| Coach | Build and manage a successful club. | `CoachCareer` + `ManagedClub` | Weekly/round season. | Set lineup, formation, tactic, halftime adjustment, then simulate. |
| Versus | Compete online through system-assigned opponents and competition groups. | `VersusUser` + `VersusSeason` + internal `VersusClub` battle aggregate | Matchmaking assignment followed by scheduled rounds/deadlines. | Submit lineup/formation/tactic; settle server-style battle atomically. |

## Player Mode specification

The existing Player expansion should remain the reference implementation for the following behavior: age around 15 at creation, 12 detailed skills, regular/trick/personal training, weekly progression, injury/energy/treatment, events, manual post-match EXP allocation, contracts/transfers, Hall of Honor, World Footballer, retirement, and rebirth.

The authoritative Player state must include a current week/date, age, position, detailed skills, derived macro attributes, energy, injury, suspension, pending training, active event, pending EXP, contract, club, season record, awards, career generation, and a version. A match settlement creates an immutable result and pending EXP ledger; the allocation command consumes that ledger exactly once.

## Coach Mode specification

Coach Mode must be modeled separately from Player Mode. The coach has six attributes: Formation Understanding, Tactical Thinking, State Adjustment, Training Level, Locker Room Prestige, and Personal Charisma. The coach manages a club roster, formation, tactic, staff, morale, player condition, budget, market, board target, league/round fixtures, QCL/continental competitions, job offers, dismissal, retirement, and rebirth.

The recurring Coach preparation flow is:

```text
Review board target and opponent
  → inspect roster/condition/morale
  → choose formation and starting XI
  → choose tactic
  → advance round and simulate first half
  → adjust tactic/substitutions at halftime
  → settle full match
  → allocate Coach EXP and resolve events/rewards
```

The transfer market must have distinct `List`, `Scout`, and `Deal` states. Player purchase, sale, negotiation, and roster settlement must be atomic. A Coach roster snapshot must be copied into Versus when a Versus fixture is locked; changing the Coach roster later must not rewrite a historical Versus result.

## Versus Mode specification

### Enrollment and group

A user invokes `/versus enroll` to create or join one Versus club. Group-based competition is supported by recovered group fields and public release metadata referring to a group-code feature. The group service owns membership, group code, capacity, season, league grade, and club assignment. One user cannot own two clubs in the same group.

### Roster and preparation

The user manages a separate Versus roster and economy. Preparation includes scouting, player condition, starting lineup, formation, tactic, captain, substitutes, and a submission deadline. The battle input is frozen at lock time as a versioned snapshot. Late changes apply to the next round, not the locked fixture.

### Fixture and settlement

Each battle has a unique `battleId`, season, league, group, round, home/away club, scheduled time, status, input snapshots, simulation seed, result, rewards, and settlement version. Settlement is idempotent:

```text
if battle.settled_at exists:
    return stored result
else:
    lock battle
    validate both snapshots and eligibility
    simulate or apply authoritative result
    write result, rewards, standings, player stats, condition changes
    mark battle settled
```

The result should expose score, ball control, shots, shots on target, corners, yellow cards, goals, MVP/battle award, player statistics, side rewards, and updated standings. The exact formula is `RECOVERY_INFERRED` and must be centralized in `game-balance.ts`.

### Offline and online semantics

Versus is online at the **competition and synchronization layer**, not necessarily real-time at the pitch-control layer. Users can submit state independently, disconnect, and later retrieve the scheduled result. A live lobby or simultaneous control mode must not be implemented as a fact until server/network evidence or product requirements explicitly confirm it.

## Discord UX contract

| Command | Mode | Purpose |
|---|---|---|
| `/mode` | All | Display Player, Coach, and Versus profiles and switch context. |
| `/player profile` | Player | Display career, age, skills, energy, injury, contract, and honors. |
| `/player next-week` | Player | Advance one week idempotently. |
| `/player train` | Player | Start regular, trick, or personal training. |
| `/player assign-exp` | Player | Allocate pending EXP to detailed skills. |
| `/coach profile` | Coach | Display coach attributes, club, target, budget, and status. |
| `/coach lineup` | Coach | Set formation and starting XI. |
| `/coach tactic` | Coach | Set tactical style and view restrictions. |
| `/coach next-round` | Coach | Advance and settle the next scheduled round. |
| `/coach market` | Coach | Open List/Scout/Deal market. |
| `/versus enroll` | Versus | Create or join a Versus competition club. |
| `/versus group create` | Versus | Create a group and generate a group code. |
| `/versus group join` | Versus | Join a group using its code. |
| `/versus roster` | Versus | Manage Versus roster and condition. |
| `/versus lineup` | Versus | Submit lineup, captain, substitutes, and formation. |
| `/versus tactic` | Versus | Submit tactic for the next locked fixture. |
| `/versus fixtures` | Versus | Show scheduled battles and deadlines. |
| `/versus settle` | Versus/admin | Settle due battles with idempotent guard. |
| `/versus result` | Versus | Display battle details, rewards, and player statistics. |
| `/versus standings` | Versus | Display group/league table and goal difference. |

Every interactive component must be owner-bound to the Discord user and mode context. Components must reject stale version, wrong owner, wrong group, and already-settled actions.

## Persistence and concurrency contract

Each mode should use a separate aggregate or JSONB namespace with a version field. A Versus settlement must use a database transaction that locks the battle row and updates both clubs, the standings, rewards, player conditions, and audit ledger together. Unique constraints should include `(season_id, group_id, round_id, battle_id)` and `(battle_id, account_id, reward_type)`.

A scheduled process is useful for `/versus settle` but is not the source of truth. The source of truth is the database transaction. A manual Discord fallback can safely retry due battles because settlement is idempotent.

## Validated backlog

### P0 — Required before calling Versus playable

| ID | Deliverable | Acceptance condition | Evidence basis |
|---|---|---|---|
| V-001 | Separate Versus aggregates and mode router | A Discord user can own Player, Coach, and Versus state independently. | `RECOVERY_SCHEMA`, product clarification. |
| V-002 | Automatic system matchmaking and private-group fallback | Opening `/versus-profile` or Versus Home automatically assigns a user to a competition/team abstraction; `/versus-join` supports explicit private group code; duplicate membership and cross-group ownership are rejected. | Public release metadata, group-code changelog, timed competition evidence; exact queue rules remain `RECOVERY_INFERRED`. |
| V-003 | Assigned Versus roster and condition | System-assigned roster, player condition, scout result, lineup, and budget persist independently. | `VersusUserSave`, internal `VersusClub` recovery aggregate. |
| V-004 | Fixture model | Round fixture has stable battle ID, home/away, deadline, state, and input snapshot. | `VersusBattleMiniData`. |
| V-005 | Deterministic battle engine | Two submitted snapshots produce reproducible result with score and team/player stats. | `VersusBattle`, `VersusBattleClub`. |
| V-006 | Atomic settlement | Repeating settlement never duplicates result, rewards, standings, or condition changes. | `ProcessSeasonMatch`, battle state fields. |
| V-007 | Standings and rewards | Score, W/D/L, goal difference, rank, side rewards, and played count update correctly. | `VersusClub`, `VersusUserSave`. |
| V-008 | Discord commands/components | Enroll, group, roster, lineup, tactic, fixture, result, standings, and settle work with owner/version guards. | Discord architecture. |
| V-009 | NPC fallback | Groups with insufficient human users still receive opponents without corrupting human ownership. | `GetOtherLeagueClubIdsExceptMySelf`. |
| V-010 | Audit and test suite | Tests cover duplicate settlement, concurrent submissions, wrong owner, deadline, injury, and reward replay. | Professional hardening requirement. |

### P1 — Depth and retention

| ID | Deliverable |
|---|---|
| V-101 | Versus scout tiers, sponsor, exchange, and coin economy. |
| V-102 | Player-condition and suspension processing per round. |
| V-103 | Group invitations, admin controls, season reset, promotion/relegation, and historical seasons. |
| V-104 | Versus honors, MVP, top-scorer, player-stat leaderboards, and battle awards. |
| V-105 | Coach-specific market List/Scout/Deal and board/job lifecycle parity. |
| V-106 | Coach staff/TA, morale, events, and halftime tactical adjustment parity. |
| V-107 | Admin/operator dashboard for stuck battles and settlement replay audit. |

### P2 — Only after product confirmation

| ID | Deliverable | Why deferred |
|---|---|---|
| V-201 | Real-time lobby and simultaneous PvP control. | Not proven by public videos or recovered signatures. |
| V-202 | Original server protocol compatibility. | Endpoints, authentication, encryption, and server bodies are not recovered. |
| V-203 | Live roster provider synchronization. | Requires a legal provider and separate data pipeline; not a gameplay prerequisite. |

## Definition of done

The mode expansion is complete when a Discord guild can run an entire Player career, a Coach season, and a Versus group season without state collision. A Versus user can join a group, manage a separate roster, submit a lineup and tactic, receive a scheduled battle result while offline, see a complete result and reward ledger, and retry every command safely. All uncertain formulas are marked `RECOVERY_INFERRED`, all historical results are immutable, and no proprietary binary or secret is committed.

## References

[1]: https://en.namu.wiki/w/%EC%B6%95%EA%B5%AC:%20%EB%9D%BC%EC%9이징스타 "Football: Rising Star — NamuWiki"

[2]: https://apps.apple.com/us/app/%EC%B6%95%EA%B5%AC-%EB%9D%BC%EC%9D%B4%EC%A7%95%EC%8A%A4%ED%83%80/id1585604439?l=ko "Football Rising Star — Korean App Store listing"

[3]: https://www.youtube.com/playlist?list=PLsfSDuKrLeQ3l_eDt6IKrcthK-L5r1h0N "Player career video playlist"

[4]: https://www.youtube.com/watch?v=hclwbUmsET4 "Coach career, season 1"

[5]: https://www.youtube.com/watch?v=sfozu7UHd0o "Coach mode, season 21"
