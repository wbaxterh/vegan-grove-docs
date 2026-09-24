---
title: Architecture decision records
description: The index of Vegan Grove's ADRs, the format they follow, and how a new one is added.
slug: /architecture/adrs
sidebar_position: 0
---

# Architecture decision records

Status: **Proposed 2026-09-24**

An ADR records one decision, the context that forced it, the alternatives that lost, and the consequences we accept. Most of Vegan Grove's early ADRs are privacy decisions, because privacy is where this product differs from its lineage.

| ADR | Decision | Status |
|---|---|---|
| [0001](/architecture/adrs/adr-0001-polyrepo) | Four repositories, one shared API, mirroring The Trick Book | Proposed |
| [0002](/architecture/adrs/adr-0002-backend-hosting) | API on one EC2 t4g.micro with PM2, not Lambda | Proposed |
| [0003](/architecture/adrs/adr-0003-auth) | Password, magic link, Apple, and Google sign-in over opaque hashed sessions | Proposed |
| [0004](/architecture/adrs/adr-0004-profiles-never-public) | Profiles are never public | Proposed |
| [0005](/architecture/adrs/adr-0005-data-minimization) | Data minimization: the field list, no GPS, EXIF stripped on device | Proposed |
| [0006](/architecture/adrs/adr-0006-maps) | MapLibre with OpenFreeMap tiles, no Google Maps | Proposed |
| [0007](/architecture/adrs/adr-0007-no-third-party-analytics) | No third-party analytics, aggregate counters only | Proposed |
| [0008](/architecture/adrs/adr-0008-database) | MongoDB Atlas M0 with Mongoose schemas | Proposed |
| [0009](/architecture/adrs/adr-0009-public-repos) | Public repositories under a proprietary license, with push protection and gitleaks | Proposed |
| [0010](/architecture/adrs/adr-0010-account-deletion) | Account deletion is a self-serve hard delete in v1 | Proposed |
| [0011](/architecture/adrs/adr-0011-messages-encryption) | Messages encrypted at rest with retention, end-to-end later | Proposed |
| [0012](/architecture/adrs/adr-0012-companion) | Ivy runs on the Anthropic API with ephemeral conversations | Proposed |
| [0013](/architecture/adrs/adr-0013-media-pipeline) | Images through S3 presigned uploads, video through Bunny Stream | Proposed |

## Format

```
---
title: "ADR-NNNN: Short title"
description: One sentence.
---
# ADR-NNNN: The decision as a sentence

| Field | Value |
|---|---|
| **Status** | Proposed, Accepted, Superseded by ADR-NNNN, or Rejected |
| **Date** | YYYY-MM-DD |
| **Deciders** | names |
| **Related** | other ADRs, optional |

## Context
## Decision
## Alternatives considered
## Consequences
### Positive
### Negative
```

Files are `docs/architecture/adrs/adr-NNNN-kebab-title.md`. The numeric prefix is part of the filename on purpose so the doc id stays stable. Add the row here and the entry in `sidebars.ts` in the same PR.

## When to write one

When a choice is hard to reverse, touches member data, adds a third party, or would surprise a future contributor. A choice that can be undone in an afternoon is a commit message, not an ADR.
