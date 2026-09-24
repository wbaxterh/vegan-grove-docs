---
title: "ADR-0008: Database"
description: MongoDB Atlas on the free M0 tier, accessed only from the API host, with every collection declared as a Mongoose schema.
---

# ADR-0008: MongoDB Atlas M0 with Mongoose schemas

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0002](/architecture/adrs/adr-0002-backend-hosting) |

## Context

Wes chose MongoDB, which The Trick Book also uses. The Trick Book's data layer is the native driver with no schemas: 38 collections shaped by `insertOne`, three different types for `userId`, no unique index on email, and indexes created fire-and-forget in route files. Atlas's free tier is enough for an MVP.

## Decision

- **MongoDB Atlas M0** (free, 512 MB) in a new Atlas project dedicated to Vegan Grove, in the AWS `us-east-1` region to sit next to the API. Upgrade to M2 or M10 when storage or connection limits bind.
- **IP allowlist** contains exactly the API host's fixed IP. No `0.0.0.0/0`, ever.
- **Mongoose 9** with a schema per collection in `src/models`, `timestamps: true`, `ObjectId` for every reference, every index declared in the schema and synced on boot (`autoIndex` on in dev and test, `syncIndexes()` run explicitly on deploy in production).
- **zod at the route boundary**, Mongoose validation as the second line.
- **TTL indexes carry retention**: sessions, magic links, invites, messages, unpinned companion conversations, dead push tokens.
- **Backups:** M0 has no automated backups. A nightly `mongodump` from the API host to a private S3 bucket with a 30-day lifecycle rule is part of M1. Backups are encrypted at rest by S3 and the bucket is not public.

## Alternatives considered

- **PostgreSQL on RDS or Neon.** A relational model fits friendships and RSVPs well, and row-level security is attractive for a privacy product. Rejected because Wes chose MongoDB, the author's fluency is there, and the RDS free tier is time-limited while M0 is not.
- **DocumentDB.** Expensive minimum and not needed.
- **Native driver without schemas, like The Trick Book.** Rejected; that is the debt this project exists to not repeat.

## Consequences

### Positive

- Zero database cost at MVP.
- The data model is readable in one directory and enforced at write time.
- A closed allowlist.

### Negative

- M0 limits: 512 MB, 500 connections, no backups, shared CPU. Mitigation: the backup job above, a 5 to 20 connection pool, and a documented upgrade path.
- Mongoose adds a layer to learn for anyone used to the raw driver. Accepted; the schema files are the documentation.
