# Discord Command Layout

The guild registry is organized around the three gameplay modes rather than a flat list of commands. `/play` is the single player-facing entry point; it opens Game Home and the following actions use owner-bound buttons/select menus whenever possible.

## Player Mode

Use `/player` for the individual career. The command groups are:

- `/player career ...` for profile, match, weekly progression, injury, contract, and retirement.
- `/player training ...` for abilities, detailed skills, trainers, tricks, and culture study.
- `/player club ...` for the official club, squad, formation, tactic, fixtures, standings, and transfer market.
- `/player honors ...` for honors, World Footballer, achievements, and claims.

The Player root command maps to existing internal handler names, so this is a Discord adapter/UX change and does not alter Player domain formulas or state isolation. From Game Home, Player creation is now position-select driven, and Player Home exposes Profile, Training, Weekly Update, Match, Club Office, and mode navigation buttons. The weekly flow is explicitly `Weekly Update → Match → pending EXP allocation → next cycle`; the legacy `advanceWeek` primitive remains as a compatibility wrapper for existing internal callers. Player Daily Event is not registered or generated; conditional career incidents remain evidence-gated and must not be represented as a daily Money choice.

## Coach Mode

Use `/coach` for management career. The supported subcommands are `career`, `profile`, `event`, `round`, `exp`, `formation`, `tactic`, `job`, `retire`, `rebirth`, and `champions`. Here `event` means a pending **Coach management decision** and not a Player daily event. Formation, tactic, and Champions actions default to Coach state when invoked through the Coach root.

## Versus Mode

Use `/versus` for system-managed multiplayer. The supported subcommands are `home`, `profile`, `roster`, `lineup`, `bid`, `standings`, `round`, `season`, and the evidence-limited `join` fallback. Matchmaking remains system-managed; no user-created club or technical `/versus-matchmake` command is exposed.

## Help and migration

`/help` explains the mode-first workflow. The guild registry now contains six root commands: `/play`, `/player`, `/coach`, `/versus`, `/help`, and `/admin`. `/play` is the recommended user entry; the grouped roots remain available as explicit fallback and operator surfaces. The previous flat commands are no longer registered, preventing Discord's command menu from mixing all gameplay modes. Internal handler aliases remain in source only to preserve domain routing and test compatibility.

All mutating roots are included in the mutation rate-limit bucket. Every chat input command is acknowledged before rate limiting and per-user queue work. Component interactions are also acknowledged centrally; `handleComponent` only defers when an interaction has not already been acknowledged. The handler then resolves the root/subcommand path to the existing internal command name and runs the original isolated domain logic.
