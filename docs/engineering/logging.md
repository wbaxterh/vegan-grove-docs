---
title: Logging
description: Structured pino logging in the API, the redaction list, and the exact boundary of what a log line may contain.
sidebar_position: 7
---

# Logging

Status: **Scaffolded 2026-09-24**

The API logs JSON lines through pino. Logs are the one place member data could leak without a schema stopping it, so the rules here are as strict as the [data inventory](/privacy/data-inventory) and enforced in code, not by convention.

## Setup

`src/lib/logger.ts` builds the logger once from the validated env:

```ts
pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  redact: { paths: REDACT_PATHS, censor: '[redacted]' },
  base: { service: 'vegan-grove-api' },
});
```

Levels are pino's: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, set by `LOG_LEVEL` (default `info`). Tests log nothing. There is no pretty printer in production; PM2 captures stdout and the lines stay machine-readable.

`pino-http` wraps every request with the same logger, assigns a request id (the incoming `X-Request-Id` if a proxy set one, else a random UUID), and writes one line per response with the status and duration. Handlers log through `req.log` so the request id is on every line they emit.

## Redaction

`REDACT_PATHS` covers headers and any object key at any depth:

```
req.headers.authorization   req.headers.cookie   res.headers["set-cookie"]
*.password   *.email   *.token   *.identityToken   *.idToken
password     email     token
```

Redaction is a safety net for the case where an object with one of these keys is logged by mistake. It is not permission to log such objects. Request bodies are never serialized at all: the pino-http serializer emits method, URL without its query string, and the request id, nothing else.

## What a log line may contain

| Field | Example | Note |
|---|---|---|
| `level`, `time`, `service` | | pino base |
| `reqId` | UUID | correlates lines for one request |
| `method`, `route` | `GET /api/places/:slug` | the route template, or the path without query |
| `statusCode`, `responseTime` | `200`, `41` | ms |
| `sid` | first 12 hex of sha256(session id) | joins lines from one session without naming it |
| `code` | `not_found` | the `AppError` code |
| `err` | stack, message | only on 5xx, only server side |

## What a log line may never contain

- Email addresses, in any field, including `msg`.
- Session tokens, magic-link tokens, provider identity tokens, API keys.
- Coordinates or bounding boxes. The map query string is stripped before logging; nothing about where a member looked is written down.
- Message text, captions, comments, companion prompts or completions.
- Handles paired with an action. `sid` exists so that a handle is not needed.
- The client's network address. nginx keeps its own access log with its own rotation; the application log does not duplicate it.

If a debugging need seems to require one of these, the answer is a temporary `debug` line with the value replaced by a length or a hash, removed before merge.

## Where logs go

Stdout, captured by PM2 into rotating files on the API host, retained briefly. There is no log shipping to a hosted service; that would be a third party holding request metadata, which the [ADR on third-party analytics](/architecture/adrs/adr-0007-no-third-party-analytics) rules out. Aggregate counts that are useful in the open come from `/api/stats`, not from logs.
