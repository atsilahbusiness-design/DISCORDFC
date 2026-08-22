# Versus UX Contract — High-Fidelity Discord Adaptation

## Product direction

Versus should follow the observed Football Rising Star rhythm: a persistent management hub, a clear pre-match lineup/setup surface, fast off-screen simulation, a result summary, and a league table/history surface. The Discord version should preserve that information architecture without copying proprietary graphics or claiming that unobserved original Versus screens are authoritative.

| Original UX pattern observed publicly | Discord equivalent |
|---|---|
| Persistent bottom navigation/home hub | Persistent Versus embed with action rows: Home, Next Battle, Lineup, Results, Standings, Registration |
| Formation/ratings pitch setup | Position-group select menus and lineup preview with estimated strength |
| Pre-match starting XI for both sides | Next Battle panel with opponent, battle ID, current submission state, and deadline |
| Fast off-screen match simulation | One-click `Process Round` after deadline, followed by result embed |
| Result screen with score and player ratings | Result embed with halftime, score, statistics, MVP, condition/reward changes |
| League table after round | Standings embed with rank, W-D-L, GD, points, and current round |
| Group-code registration/competition entry | Registration embed with status, group code, competition identity, capacity, and next action |
| Scout/status management surfaces | Keep a clearly labeled future/available surface only after costs, offers, and effect rules are recovered; do not fabricate mechanics |
| Contract/management popups | Small action-focused embeds rather than raw JSON or long command syntax |

## Interaction contract

The primary entry point is the existing owner-bound **Versus Mode** button, which opens the Versus Home panel. `/versus-profile` remains a direct command alias. From Home, the user can inspect Registration/group status, the next battle, open lineup setup, open standings, or view the latest result. `/versus-roster` remains a text fallback and diagnostic view. Public changelogs also mention advanced scouting and player-status improvement in battle mode, but their exact UI and rules are not publicly recoverable; those mechanics must not be represented as completed until evidence or a deliberate balance specification exists.

The lineup builder must use Discord components rather than requiring the user to type eleven IDs. Because a Discord select menu has a limited option count, the builder is grouped by position: one goalkeeper selector, defender selector, midfielder selector, forward selector, then a substitute selector. The component state is stored in the user’s ephemeral interaction flow and is only persisted after confirmation. The final confirmation must show formation, tactic, captain, XI, substitutes, roster version, deadline, and an **estimated** strength label.

Every component custom ID is owner-bound. Any state-changing action also carries the battle ID and roster version, and the domain revalidates both against the latest store state. A stale or late interaction produces a clear ephemeral error and directs the user back to Versus Home or `/versus-roster`.

## Screen states

| State | Required content | Primary actions |
|---|---|---|
| Home | Club, group, round/deadline, opponent, battle ID, submission state, wallet | Registration, Lineup, Next Battle, Results, Standings |
| Lineup | Position slots, eligible roster, formation, tactic, captain, substitutes | Choose by position, preview, confirm |
| Preview | Full XI, bench, tactic, captain, version/deadline, estimated strength | Confirm, Edit, Cancel |
| Submitted | Submitted timestamp, locked status, selected setup, deadline | Edit before deadline, Home |
| Result | Score, halftime, stats, MVP, rewards, roster condition | Standings, Home, Results |
| Standings | All clubs, rank, W-D-L, GD, points, round progress | Home, Next Battle |
| Finished season | Final rank, reward, history, next-season state | History, Home |
| Registration | Enrollment status, group code, competition, capacity, season state | Home, Next Battle, Lineup |
| Scout/status (evidence-only) | Reserve surface for advanced scout and player-status improvement; no invented cost/effect | Not exposed as a live mechanic yet |

## Discord limitations

Discord does not provide the original mobile bottom navigation bar, drag-and-drop pitch, or unlimited on-screen cards. The contract therefore uses persistent embeds, buttons, select menus, and ephemeral previews. The original visual style should be approximated through consistent titles, colors, ordering, and terminology, while all assets and text remain original to this project.
