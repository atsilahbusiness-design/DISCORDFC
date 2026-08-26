# Production Release Checklist — Football Rising Star Discord

## Release boundary

This release is suitable for a production Discord deployment only when a real PostgreSQL instance, a single active worker instance or a database-backed worker lease, secret-managed Discord credentials, and an operational backup plan are available. The JSON store is development-only and is rejected when `NODE_ENV=production`.

## Required environment

| Variable | Required | Purpose |
|---|---:|---|
| `DISCORD_TOKEN` | Yes | Bot gateway authentication |
| `DISCORD_CLIENT_ID` | For command registration | Discord application identifier |
| `DISCORD_GUILD_ID` | Optional | Guild-scoped registration for immediate updates; omit for global registration |
| `DATABASE_URL` | Yes in production | PostgreSQL persistence |
| `NODE_ENV` | Yes | Set to `production` |
| `ADMIN_USER_IDS` | Recommended | Comma-separated admin allowlist |
| `MAINTENANCE_INTERVAL_MS` | Optional | Background maintenance interval; minimum 1000 ms |
| `RATE_LIMIT_MAX` | Optional | Global interactions per window |
| `RATE_LIMIT_WINDOW_MS` | Optional | Global limiter window; minimum 1000 ms |

Never commit `.env`, database passwords, Discord tokens, or generated private credentials.

## Deployment order

1. Provision PostgreSQL and create a database role with only the permissions required by the application.
2. Configure the production secret manager with the required environment variables.
3. Run `pnpm install --frozen-lockfile` and `pnpm build` in the release artifact.
4. Run `pnpm db:migrate` against the target database and verify that canonical Player, Versus queue, match, market, reservation, and ledger tables exist.
5. Register commands with `pnpm commands:register`. Use guild-scoped registration during controlled rollout; use global registration only after command definitions are stable.
6. Start exactly one active worker process unless database-backed worker coordination has been enabled. The worker must process maintenance, expired Versus listings, and scheduled state transitions.
7. Verify bot readiness, PostgreSQL connectivity, maintenance completion logs, and Discord interaction response before opening public access.
8. Run a smoke scenario with two test accounts: create Player/Coach state, enter Versus, submit lineups, place competing bids, expire a listing, settle a round, and verify the ledger and notifications.

## Release gates

The release is blocked when any of the following is true: tests fail; build fails; dependency audit reports a high or critical vulnerability; secret scan detects credentials; production starts without PostgreSQL; migrations are not idempotent; two workers can settle the same job without a lock/idempotency record; backups cannot be restored; or the bot cannot report a failed operation without losing the user state.

## Rollback

Stop new interaction traffic, stop the worker, preserve logs and database snapshots, deploy the previous application artifact, and restart one worker only. Do not roll back the database schema blindly. Every schema change must be backward-compatible with the previous application version or have a tested down/forward migration procedure.

## Known parity boundary

MMR, exact matchmaking coefficients, auction price curves, Scout costs/effects, Sponsor payout/cooldown, player-status boost coefficients, and some season rollover rules remain evidence-limited. They must stay versioned and explicitly labeled inferred until primary evidence is supplied. This is a release transparency requirement, not a reason to invent server behavior.

## Verification commands

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm audit --prod --audit-level high
git diff --check
pnpm db:migrate
pnpm commands:register
pnpm start
```

The release owner should record the commit SHA, migration timestamp, database backup identifier, command registration scope, worker instance identifier, and smoke-test result for every deployment.
