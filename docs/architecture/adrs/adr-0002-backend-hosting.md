---
title: "ADR-0002: Backend hosting"
description: The API runs on one EC2 t4g.micro with PM2 and nginx, chosen over Lambda because a fixed egress IP keeps the database allowlist closed.
---

# ADR-0002: The API runs on one small EC2 instance, not Lambda

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0008](/architecture/adrs/adr-0008-database) |

## Context

The API must be cheap to run, easy to operate by one person, and must talk to MongoDB Atlas on the free M0 tier. M0 has no private endpoint or VPC peering, so the only way to restrict who can reach the database is Atlas's IP allowlist. The Trick Book runs its API on one EC2 instance with PM2, which the author operates comfortably, but that instance is on an aging OS line and is shared with other experiments.

## Decision

A new EC2 `t4g.micro` (Ubuntu 24.04 arm64) in `us-east-1`, dedicated to Vegan Grove, running the API under PM2 behind nginx with a certbot certificate. The instance has a fixed public IP, and the Atlas project allowlists exactly that IP. Deploys are a pull and `pm2 reload`, documented in [deployment](/deployment/backend). Socket.IO runs in the same process.

## Alternatives considered

- **Lambda plus API Gateway with `serverless-http`.** Near zero cost at MVP traffic and no OS to patch. Rejected on privacy: a Lambda has no fixed egress IP without a NAT gateway (roughly $32 a month, more than the whole rest of the stack), so the Atlas allowlist would have to be `0.0.0.0/0`. It also has no long-lived sockets for messaging.
- **A second PM2 app on The Trick Book's existing instance.** Zero marginal cost. Rejected: shared blast radius with an unrelated app, an older OS line, and a privacy-first product should not share a box with anything.
- **App Runner or Fargate.** Simpler ops than EC2 but the minimum monthly cost is higher and the egress IP problem is the same as Lambda without a NAT.
- **Lightsail.** Comparable price, fewer controls. The author already operates EC2.

## Consequences

### Positive

- A closed database allowlist.
- One operating model the author already knows, with a fresh OS and nothing else on the box.
- Socket.IO, workers, and cron-like jobs run without extra services.

### Negative

- An OS to patch. Mitigation: unattended-upgrades on, a monthly check in the maintenance calendar, and nothing on the box except the API.
- Cost is about $10 a month (instance plus the public IPv4 charge), not zero. See the [cost sheet](/deployment/cost-sheet).
- Vertical scaling only. At the point that matters, the fix is a bigger instance type, and the code does not need to change.
