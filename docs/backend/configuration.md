---
title: Configuration
description: Every environment variable the API reads, what it is for, the shape of its value, and how a bad environment fails at boot.
sidebar_position: 4
---

# Configuration

Status: **Scaffolded 2026-09-24**

All configuration is environment variables, read once by `src/config/env.ts`, validated with zod, and exported as a typed `Env` object. Nothing else in the codebase touches `process.env`. `.env.example` carries every name with one comment and no values; the real file lives outside the checkout on the host and in `.env` (gitignored) locally.

## Fail fast

`loadEnv()` runs `envSchema.safeParse(process.env)` and throws an `EnvError` listing every problem at once:

```
Invalid environment:
  MONGODB_URI: MONGODB_URI is required
  DM_ENCRYPTION_KEY: must be 32 bytes, base64 encoded
```

`server.ts` calls it before connecting to anything, so a misconfigured process exits in the first second with a readable message and PM2 records the restart. The schema also has cross-field rules: `EMAIL_TRANSPORT=smtp` requires the SMTP variables; `NODE_ENV=production` requires `DM_ENCRYPTION_KEY`, `CORS_ORIGINS`, and `EMAIL_TRANSPORT=smtp`. Development can run with a near-empty file.

## Variables

Shapes only. Values are never written anywhere public.

| Name | Purpose | Shape and default |
|---|---|---|
| `NODE_ENV` | mode | `development`, `test`, `production` |
| `PORT` | listen port on loopback behind nginx | integer |
| `LOG_LEVEL` | pino level | `fatal` to `trace`, default `info` |
| `TRUST_PROXY` | hops to trust for the client address | integer, `0` locally, `1` behind nginx |
| `CORS_ORIGINS` | browser origins allowed to call the API | comma-separated URLs, required in production |
| `MONGODB_URI` | Atlas connection string | `mongodb+srv://...`, required |
| `MONGODB_DB_NAME` | database name override | optional |
| `SESSION_TTL_DAYS` | session lifetime | integer, default `30` |
| `MAGIC_LINK_TTL_MINUTES` | magic link lifetime | integer, default `15` |
| `MAGIC_LINK_BASE_URL` | the web page the email links to | URL |
| `RATE_LIMIT_AUTH_MAX` | requests per window on `/api/auth/*` | integer |
| `RATE_LIMIT_MAGIC_LINK_MAX` | per window on magic-link issue | integer, lower |
| `RATE_LIMIT_COMPANION_MAX` | per window on the companion | integer |
| `EMAIL_TRANSPORT` | how mail is sent | `log` (print to the log, dev) or `smtp` |
| `EMAIL_FROM` | sender | `Name <address>` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SES SMTP credentials | required when transport is `smtp` |
| `AWS_REGION` | for S3 presigning | default `us-east-1` |
| `S3_MEDIA_BUCKET` | image bucket | bucket name |
| `S3_PRESIGN_TTL_SECONDS` | presigned PUT lifetime | 30 to 3600, default `300` |
| `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY` | video uploads | optional until video ships |
| `ANTHROPIC_API_KEY` | companion | optional; the route answers `503` without it |
| `COMPANION_MODEL` | model id | string, default `claude-opus-5`; configuration, never a literal in code |
| `COMPANION_MAX_TOKENS` | completion cap | integer |
| `COMPANION_HISTORY_LIMIT` | messages kept per conversation | integer, default `20` |
| `DM_ENCRYPTION_KEY` | AES-256-GCM key for messages at rest | 32 bytes, base64; required in production |
| `DM_KEY_ID` | stored with each message for rotation | string, default `v1` |
| `DM_RETENTION_DAYS` | message TTL | integer, default `90` |
| `APPLE_CLIENT_ID` | Sign in with Apple audience | optional |
| `GOOGLE_CLIENT_IDS` | Google Sign-In audiences | comma-separated, optional |
| `OVERPASS_URL` | Overpass mirror for the OSM seed | URL |
| `STATS_CACHE_TTL_MS` | `/api/stats` cache | integer, default 5 minutes |
| `REMINDER_TICK_MS` | reminder worker interval | integer |

## Local development

```
NODE_ENV=development
MONGODB_URI=<a local MongoDB or a dev Atlas cluster>
EMAIL_TRANSPORT=log
CORS_ORIGINS=<the web app's local dev origin>
```

`EMAIL_TRANSPORT=log` prints the magic link to the terminal instead of sending it, so login works with no SES account. The companion, S3, Bunny, and the social providers are all optional locally; their routes return `503 { code: 'not_configured' }` rather than crashing.

## Rotation

`DM_ENCRYPTION_KEY` is rotated by adding the new key under a new `DM_KEY_ID`, decrypting with whichever id a message carries, and re-encrypting on read or in a worker. The move from an env key to KMS is [ADR 0011](/architecture/adrs/adr-0011-messages-encryption)'s follow-up. Session tokens need no rotation: they are random per session and only their hash is stored.
