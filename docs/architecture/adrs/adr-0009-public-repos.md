---
title: "ADR-0009: Public repositories"
description: All four repositories are public under a proprietary license, with GitHub push protection, secretlint on every commit, and gitleaks in CI.
---

# ADR-0009: Public repositories under a proprietary license

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |

## Context

Wes wants the repos public with an open-source feel while keeping the rights: "go public with a real license, proprietary." Two facts shaped the mechanics. GitHub's secret scanning and push protection are free only on public repositories; private repositories need a paid product. And The Trick Book's public history contains database credentials, a non-expiring admin token, a video-platform key, and a maps key, committed early and never fully revoked. Public code is also a trust signal for a privacy product: anyone can verify the claims on the privacy page.

## Decision

- All four repositories are public from the first push.
- Each carries the same `LICENSE`: all rights reserved, with explicit permission to view, study, run locally, and submit issues and pull requests. Contributions are licensed to the copyright holder. Redistribution and hosting are not permitted.
- GitHub push protection and secret scanning are enabled on every repo on day one. Dependabot is enabled.
- `secretlint` runs on every staged file in every commit through lint-staged and is treated as a stop, never bypassed. `gitleaks` runs in CI over the full history on every push and PR.
- `.env` files, `ios/`, `android/`, and any credentials file are gitignored in every repo, and `.env.example` carries names only.
- The [disclosure policy](/privacy/disclosure-policy) applies to code comments and README files, not just the docs.

## Alternatives considered

- **Private until release.** Hides the scaffold while it is rough, but loses push protection at exactly the stage where secrets are most likely to be committed, and history cannot be un-published later. Rejected.
- **An OSI license (AGPL, MIT).** Invites contributions and forks and fits the vibe. Rejected by Wes for now: he wants to keep the rights. Can be revisited by superseding this ADR; relicensing from proprietary to open is easy, the reverse is not.

## Consequences

### Positive

- Free secret scanning and push protection.
- Auditable privacy claims.
- Issues and PRs from the community without giving away the product.

### Negative

- "Public but proprietary" surprises some people. The `LICENSE` and `CONTRIBUTING.md` explain it in plain words.
- Anything committed is visible immediately, including mistakes. The pre-commit hook and the disclosure policy are the controls, and the ruleset requires a PR so a second look happens before `main`.
