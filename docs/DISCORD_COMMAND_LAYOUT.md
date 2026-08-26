# Discord Command Layout

The guild registry is organized around the three gameplay modes rather than a flat list of commands.

## Player Mode

Use `/player` for the individual career. The command groups are:

- `/player career ...` for profile, match, weekly progression, injury, contract, and retirement.
- `/player training ...` for abilities, detailed skills, trainers, tricks, and culture study.
- `/player club ...` for the official club, squad, formation, tactic, fixtures, standings, and transfer market.
- `/player honors ...` for honors, World Footballer, achievements, and claims.

The Player root command maps to existing internal handler names, so this is a Discord adapter/UX change and does not alter Player domain formulas or state isolation.

## Coach Mode

Use `/coach` for management career. The supported subcommands are `career`, `profile`, `event`, `round`, `exp`, `formation`, `tactic`, `job`, `retire`, `rebirth`, and `champions`. Formation, tactic, and Champions actions default to Coach state when invoked through the Coach root.

## Versus Mode

Use `/versus` for system-managed multiplayer. The supported subcommands are `home`, `profile`, `roster`, `lineup`, `bid`, `standings`, `round`, `season`, and the evidence-limited `join` fallback. Matchmaking remains system-managed; no user-created club or technical `/versus-matchmake` command is exposed.

## Help and migration

`/help` explains the mode-first workflow. The guild registry now contains five root commands: `/player`, `/coach`, `/versus`, `/help`, and `/admin`. The previous flat commands are no longer registered, preventing Discord's command menu from mixing all gameplay modes. Internal handler aliases remain in source only to preserve domain routing and test compatibility.

All mutating roots are included in the mutation rate-limit bucket. Every chat input command is acknowledged before rate limiting and per-user queue work. The handler then resolves the root/subcommand path to the existing internal command name and runs the original isolated domain logic.
