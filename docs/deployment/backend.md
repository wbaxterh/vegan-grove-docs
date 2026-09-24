---
title: Backend deployment
description: The API host layout, PM2 and nginx, the deploy runbook with placeholders, rollback, and the health check.
sidebar_position: 2
---

# Backend deployment

Status: **Proposed 2026-09-24**

The API runs on one EC2 `t4g.micro` (Ubuntu 24.04, arm64) in `us-east-1`, as a PM2-managed Node 24 process behind nginx with a certbot certificate for `api.vegangrove.org`. Small on purpose: clients upload media directly to S3 and Bunny, the database is Atlas, and the companion streams from the Anthropic API, so the host does routing, auth, and queries.

## Host layout

- **Node 24** from `.nvmrc`, installed once for the service user.
- **PM2** started from `ecosystem.config.cjs` in the repo. The file names the process, sets `NODE_ENV=production`, points at `dist/server.js`, and enables cluster mode with one instance (a `t4g.micro` has two vCPUs and one gigabyte; a second instance can come later). `pm2 startup` and `pm2 save` make it survive a reboot.
- **nginx** terminates TLS and proxies to the app on loopback. It forwards `X-Forwarded-For` and `X-Request-Id`; the app sets `TRUST_PROXY=1` so rate limiting sees the client, not nginx.
- **Environment file** outside the checkout, in a directory only the service user can read, referenced from the ecosystem file. Never inside the repo directory, never committed, never in the docs. Names are in `.env.example`; meanings are in [configuration](/backend/configuration).
- **Releases** live side by side under one parent directory, one directory per commit, with a `current` symlink. PM2 runs `current`.

## Atlas access

Atlas M0 allows connections only from listed addresses. The instance has an Elastic IP so the address is stable across stop and start; that address is allowlisted in the Atlas project and written nowhere public. If the instance is replaced, the new Elastic IP is attached first and the allowlist updated before the app starts.

## Deploy runbook

Preconditions: the PR is merged, `validate` was green, and you have the `main` SHA.

1. `ssh <api-host>` as the service user.
2. `cd <releases-dir>` and `git clone --depth 1 --branch main <repo-url> <sha>` (or `git fetch` in a cached clone and `git worktree add <sha> <sha>`).
3. `cd <sha>` and `npm ci` (dev dependencies are needed for the build).
4. `npm run build`, then `npm prune --omit=dev`.
5. `ln -sfn <sha> ../current`.
6. `pm2 reload ecosystem.config.cjs --update-env` from `current`. Reload is zero-downtime in cluster mode: the old worker drains after the new one is listening.
7. `curl -fsS https://api.vegangrove.org/healthz` and expect `{"ok":true}`.
8. `pm2 logs --lines 50 --nostream` and read for a startup error or an `EnvError`.
9. Remove release directories older than the last three.

An `EnvError` at step 8 means a new variable was added to `src/config/env.ts` and not to the host's env file. Add it, then repeat from step 6. `env.ts` fails fast on purpose so this is caught at reload, not at the first request that needs the value.

## Rollback

Point `current` back at the previous release directory and reload:

```bash
ln -sfn <previous-sha> current
pm2 reload ecosystem.config.cjs --update-env
```

Under a minute, no rebuild. Schema changes ship additively (new fields optional, new indexes built by Mongoose on boot) so the previous release runs against the current data. A change that cannot roll back this way says so in its PR rollback plan.

## Health check

`GET /healthz` pings the database and returns `200 { ok: true }` or `503 { ok: false }`. nginx exposes it publicly; it carries no version, host, or uptime detail. The Atlas connection state and PM2's own restart counter are what you read when it fails.

## What is not automated

No GitHub Actions job deploys to the host. That needs a credential on GitHub that can reach the box, a decision recorded in [open questions](/roadmap/open-questions) rather than defaulted. The runbook is short enough to run by hand for the first releases.
