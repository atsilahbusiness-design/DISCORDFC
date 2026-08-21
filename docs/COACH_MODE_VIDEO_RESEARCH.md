# Coach Mode — Video Research Report

**Status:** Video-observed gameplay synthesis  
**Tanggal:** 2026-08-22  
**Corpus:** Six Coach/overview video analyses, supplemented by recovery signatures.  
**Provenance:** Directly visible behavior is `VIDEO_OBSERVED`; formula bodies and server details remain `RECOVERY_INFERRED` unless independently verified.

## Executive conclusion

Coach Mode is a **single-coach club-management career** built around weekly/round progression, roster construction, formations, tactics, staff, club targets, events, transfers, job offers, and board consequences. The coach is a retired star who starts a new career, manages a club, earns EXP for six coach attributes, and can be fired, move to another club, retire, and rebirth.

The match is simulated, but Coach Mode is more interactive during preparation than Player Mode. The coach chooses a formation, starting lineup, tactical style, substitutions, and halftime adjustments. The simulator exposes possession, shots, shots on target, corners, cards, goals, player ratings, and the effect of tactical choices. The recovery dump confirms separate Coach battle classes, Coach tactics/formation configurations, Coach events, Coach honors, and Coach save-state.

## Coach career loop

```text
Create or inherit retired-star coach
        ↓
Choose club offer and accept board target
        ↓
Inspect roster, injuries, morale, staff, budget, and market
        ↓
Set formation, lineup, tactics, and training/staff plan
        ↓
Advance week/round
        ↓
Simulated match with halftime tactical decision
        ↓
EXP assignment to coach attributes and club rewards
        ↓
Resolve events, transfers, board feedback, job offers
        ↓
Season summary, honors, target outcome, promotion/relegation
        ↓
Continue, change club, get fired, retire, or rebirth
```

| System | Repeated video observation | Recovery alignment |
|---|---|---|
| Coach identity | Retired star, nationality, age, level, honors, assets, salary, and preferred tactic. | `CoachBase`, coach ID, `CoachAbilitySaveData`, coach honors. |
| Club appointment | Multiple club offers contain league, ranking, target, and salary. | `CoachClub`, `CoachUserSaveData`, contract fields. |
| Board target | Goals include promotion, championship, avoiding relegation, or staying in QCL zone. | `TargetAchieve`, club season fields, achievement IDs. |
| Roster | Player ability, position, market value, form, injury, card status, sale and signing operations. | `CoachNPCPlayer`, club/player save data, coach battle player payload. |
| Staff | Assistants/TA provide stamina recovery, tactical bonuses, or development effects. | `CoachPersonalTrainerConfig`, trainer `Ratio` and `WeekCost`. |
| Formation | 4-1-3-2, 4-3-3, 3-4-3, 3-5-2, 5-3-2, and other setups. | `FormationConfig` with positional counts and `CoachFormationId`. |
| Tactics | Equal OFF/DEF, Down the Wings, Middle Thrust, Counterattack, Tiki-Taka, Long Ball, Offense Full, Defense Full. | `CoachTacticsConfig` has `atk`, `def`, `ballControl`, restrictions, and formation conflicts. |
| Match | Pre-match opponent view, lineup, simulated halves, halftime changes, final statistics. | `CoachBattle`, `CoachBattleClub`, `BattleCoach`, and summary methods. |
| Career consequences | Job offers, salary negotiations, dismissal, new club, retirement, rebirth. | Coach achievement IDs include `CoachLoseJob`, `CoachPerfectRetire`, and `CoachReincarnation`. |

## Coach attributes and EXP

The videos repeatedly expose six coach attributes:

| Attribute | Function visible or implied in gameplay |
|---|---|
| Formation Understanding | Formation setup and positional understanding. |
| Tactical Thinking | Tactical selection and tactical adjustment. |
| State Adjustment | Managing player/team status and match condition. |
| Training Level | Improving player development and training effects. |
| Locker Room Prestige | Morale, locker-room interventions, and team unity. |
| Personal Charisma | Negotiation, player interest, job offers, and media/social influence. |

After simulated matches, the coach receives EXP and manually assigns it to these attributes, mirroring Player Mode's manual EXP allocation but using a separate Coach catalog. The recovery dump defines `CoachAbilityId` values for formation, tactics, status training, training level, locker-room prestige, and personal charisma, with a maximum coach ability level observed in signatures. Exact XP curves are not verified and remain `RECOVERY_INFERRED`.

## Roster and transfer market

The market has three recurring views: **List** for available players, **Scout** for targeted discovery, and **Deal** for active negotiations. Scouts can be filtered by position, ability range, budget, and rating. A signing involves an offer relative to market value and the player's intention/interest, which is affected by club fame and coach charisma. Existing players can be listed for sale, and the resulting budget is used for further acquisitions.

A robust Discord implementation should model a market listing, scout search, negotiation state, acceptance/rejection, transfer settlement, and roster capacity as separate transactions. Human-versus-human Versus Mode should not reuse mutable Coach roster objects without a snapshot; the original recovery has separate `VersusClub` and `CoachClub` structures.

## Formation and tactics

The videos show the coach reviewing the opponent's head coach, formation, tactics, and star player before selecting a response. Formation changes are positional: the coach moves players among goalkeeper, defensive, midfield, and forward slots. Tactics are categorical but have numerical effects and interaction rules in recovery. `CoachTacticsConfig` explicitly stores attack, defence, ball-control, restricted tactics, and conflicting formations. `FormationConfig` stores counts, weight, a formation string, and a coach formation ID.

The match is not a real-time action game. The strategic interaction is asynchronous within the match simulation: the coach can adjust tactics and substitutions at halftime after seeing first-half statistics. This is a key distinction from Player Mode, where the user primarily observes the simulation and assigns player EXP afterward.

## Time and competition structure

Coach videos describe progression as weeks and rounds, with seasons spanning approximately 38 league rounds. Winter Break is a meaningful period for recovery, study, morale, and formation understanding. The club participates in domestic leagues and the QCL, which visibly follows a group-stage and knockout structure analogous to the Champions League. The recovery contains `CoachRoundConfig`, `CoachSeasonCDConfig`, `RoundBattleRuleConfig`, and separate Coach Champions League save-state.

A Discord Coach implementation should use explicit season and round IDs, not infer rounds from message timestamps. Every round should have a fixture list, a settlement state, a board-target checkpoint, and a deadline or advance action.

## Events, morale, and board state

Coach events include press criticism, rumors, locker-room speeches, team building, tactical discussions, player discipline, financial crises, fan conflicts, media appearances, commercial endorsements, and risky strategic choices. These events affect morale, club impression, assets, coach attributes, and sometimes the probability of meeting board targets. The recovery dump confirms separate Coach event and choice configs, so Coach events should not be copied from Player events.

The board target is a central success condition. Finishing below the target can cancel a bonus, reduce approval, or lead to dismissal. A coach can receive job offers from other clubs, negotiate salary, leave voluntarily, be fired, become unemployed, retire, or rebirth with inherited benefits.

## Coach Mode and online status

The six analyzed Coach videos show simulated matches against AI-style opponent coaches and no visible live lobby, matchmaking, or human online session. This is consistent with a standalone Coach career. The user has separately established that the product also has a **Versus Mode** that is the online mode. The recovery confirms a separate `Versus*` runtime and payload, so DISCORDFC should not force online multiplayer into Coach Mode itself.

## Coach-specific implementation boundaries

| Requirement | Confidence | Notes |
|---|---|---|
| Coach career is separate from Player career | High | Main-menu and coach identity observations; separate recovery schemas. |
| Weekly/round season progression | High | Repeated across six videos and `CoachRoundConfig`. |
| Formation and tactics matter | High | Visible choices and `CoachTacticsConfig` fields. |
| Match has halftime adjustment | High | Repeated top-down match screens and halftime stats. |
| Market has List/Scout/Deal views | High | Repeated across videos and client recovery. |
| Board targets and job changes | High | Repeated targets, offers, dismissals, and recovery achievement IDs. |
| Exact tactical formula | Low | Method bodies and numeric balance are not recovered. `RECOVERY_INFERRED`. |
| Coach Mode itself is live multiplayer | Not supported by videos | Online behavior belongs to the separate Versus Mode according to the user's product knowledge. |

## References

[1]: https://www.youtube.com/watch?v=hclwbUmsET4 "Coach career, season 1 — Cultural Leonesa"

[2]: https://www.youtube.com/watch?v=sfozu7UHd0o "Coach mode, season 21 — Hellas Verona"

[3]: https://www.youtube.com/watch?v=OcLLGz2hq_o "Coach career, season 28"

[4]: https://www.youtube.com/watch?v=YWWDntsADP4 "Coach career, season 32"

[5]: https://www.youtube.com/watch?v=MhGAiD815S0 "Coach career, season 15"

[6]: https://www.youtube.com/watch?v=sS5T8E43LQI "Football Rising Star gameplay walkthrough"
