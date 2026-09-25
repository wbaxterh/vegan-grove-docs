---
title: Open questions
description: Decisions not yet made, who owns them, and what would settle each one.
sidebar_position: 2
---

# Open questions

Status: **Proposed 2026-09-24**

Questions that need an answer before or during a milestone. Each has an owner (Wes unless noted) and a "settled by". When one is settled it becomes an ADR or a line in a feature page and is removed here.

## Before M0.5 (provisioning)

| Question | Options | Settled by |
|---|---|---|
| Apple developer team and app record | Reuse The Trick Book's team, new app record `org.vegangrove.app` | Wes creates the record |
| SES sending domain | `mail.vegangrove.org` subdomain with DKIM, production access request | Wes files the request |
| AWS IAM | Create a scoped IAM user or role for deploys; the account's root credentials are currently what the CLI uses, which should stop | Wes |

## Product

| Question | Options | Settled by |
|---|---|---|
| Companion name | Ivy (working), or something else | Wes, before M4 |
| Grove list for launch | The ten regions proposed, or fewer to start | Two organizers' feedback in M2 |
| Public posting at all | Ship the opt-in switch, or delay public posts to after M5 | Wes, before M3 |
| Business claiming | Claim a Place in M2, or later | Whether restaurants ask |
| Recurring events | Series in v2 | M2 usage |

## Privacy and security

| Question | Options | Settled by |
|---|---|---|
| Message key custody | Env var on the host (v1) then KMS envelope (M3) | The M3 ADR |
| Server-side EXIF check | Reject images with GPS tags at the API as a second line | M2 |
| Backup encryption | S3 SSE-S3 (default) or a KMS key | M1 |
| Crash reporting | None, or a tool configured without identifiers | Follow-up ADR after M4 |
| Data export for members | CSV of own data beyond the action log | M5 |

## Engineering

| Question | Options | Settled by |
|---|---|---|
| Contract tests between API and clients | Playwright or vitest against a running API in CI | M2 |
| Amplify and Next 16 | Stay on 15 until Amplify documents 16 | Amplify docs |
| Protomaps self-hosting | Test once in M1 so the fallback is known to work | M1 |
| Monorepo revisit | Only if the team grows | ADR-0001 supersession |

## Settled since the plan

- Domain: `vegangrove.org` registered through Route 53 on 2026-09-24; web, www, docs, and api records live. Repos: public, proprietary license. Hosting: own t4g.micro. Auth: password, magic link, Apple, Google; Proton through magic link. DMs, feed with video, media library, and the companion are in v1 scope. Connections are Friends, not Allies. All on 2026-09-24.
