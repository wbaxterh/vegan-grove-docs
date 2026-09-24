---
title: "ADR-0001: Polyrepo"
description: Vegan Grove is four repositories with one shared API, mirroring The Trick Book, with consistent names.
---

# ADR-0001: Four repositories, one shared API

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |

## Context

The Trick Book runs as four repos: a backend, a mobile app, a website, and a docs site, each with its own CI, ruleset, and deploy target. The author knows that shape well, and the tooling around it (Amplify watching one repo, EAS building one repo, Pages deploying one repo) assumes one deployable per repository. The Trick Book's repo names do not match their roles (`TrickBookFrontend` is the mobile app), which has caused real confusion.

## Decision

Four repositories under `wbaxterh`, named for their role: `vegan-grove-api`, `vegan-grove-web`, `vegan-grove-mobile`, `vegan-grove-docs`. Locally they live at `~/Documents/VeganGrove/repos/{api,web,mobile,docs}`. Each carries the same governance files and the same `validate` CI contract. Shared types are duplicated deliberately (the API's zod schemas are the source of truth; clients keep their own TypeScript types and a contract test catches drift).

## Alternatives considered

- **Monorepo with a workspace tool.** One PR can change the API and both clients together, and types can be shared as a package. Rejected for now: Amplify, EAS, and Pages each want a repo root, the author would be learning a workspace tool alongside everything else, and a monorepo makes the public-repo story harder (one repo, one license, one secret-scanning surface for four deployables).
- **Two repos (api plus a clients monorepo).** Halfway; still needs the workspace tool.

## Consequences

### Positive

- Deploy tooling works without configuration.
- Each repo's blast radius, ruleset, and Dependabot stream are small.
- Same conventions as The Trick Book, so muscle memory transfers.

### Negative

- Cross-repo changes are two or three PRs and need the change-management rules in the [repo dependency map](/architecture/repo-dependency-map).
- Types are duplicated across API and clients. Mitigation: the API publishes its response types in the docs, and each client has a contract test against a running API in CI (planned for M2).
- If the team grows past one, a monorepo becomes worth revisiting; this ADR would then be superseded.
