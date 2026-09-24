---
title: Development workflow
description: Branches, pull requests, review, the web promotion pattern, and what to do when CI fails.
sidebar_position: 2
---

# Development workflow

Status: **Proposed 2026-09-24**

One flow for all four repos. Small branches, one PR each, squash into `main`. The only repo with a second long-lived branch is the web app, and only once it has real traffic.

## Branches

Branch from `main`, name with the same prefixes as the commit subjects:

| Prefix | Use |
|---|---|
| `feat/` | new behavior |
| `fix/` | a bug, ideally with the failing test first |
| `docs/` | documentation only (any repo) |
| `chore/` | tooling, dependencies, CI |
| `refactor/` | no behavior change |
| `test/` | tests only |

Short kebab-case after the slash: `feat/places-bbox-query`. No ticket numbers; the PR is the ticket.

## Pull requests

Every PR starts from `.github/pull_request_template.md`. The summary block is the completion triple from the [principles checklist](/product/principles), plus rollback:

```
Activist outcome:
What changed:
Privacy and trust checks done:
Signal to watch:
Rollback plan:
```

Fill it in even for a one-line fix. "Activist outcome: none, tooling" is a valid answer; a blank is not. The checklist below it mirrors the privacy rules and is ticked, not deleted.

Review: `CODEOWNERS` routes every path to the maintainer. The ruleset requires a code-owner review and a green `validate`. With one maintainer, the admin bypass covers the review requirement; it never covers the check. Before you push, run `npm run validate` locally so the PR is green on arrival.

Merge: squash only. The squash subject is a conventional commit subject, because it is the line that shows up in [releases](/releases).

## The web promotion pattern (reserved)

The web app is the only public surface that redeploys on every merge (Amplify builds `main`). Once the site has members, the web repo gains a `staging` branch: feature PRs merge to `staging`, Amplify builds it as a preview, and one promotion PR moves `staging` to `main`. A `production-promotion` check rejects any PR into `main` from another branch. Until then the web repo works like the others. The API, mobile, and docs repos do not get a `staging` branch: the API has a release-directory rollback ([backend deployment](/deployment/backend)), mobile has store tracks, docs are docs.

## When CI fails

1. Open the failed job and read the first error, not the last. Biome and `tsc` list everything; the first item is usually the cause.
2. Reproduce locally with `npm run validate`. If it passes locally and fails in CI, check Node (`.nvmrc` is the truth), line endings (see [linting](/engineering/linting-formatting)), and whether a lockfile change was left uncommitted.
3. Fix, commit, push. Do not re-run a job hoping for a different answer unless it failed on a network step.
4. If the `secrets` job fails, stop. Treat the finding as live: rotate the credential first, then remove it from history before the PR merges. Rewriting `main` is never the fix; rewriting the branch is.

## Dependencies

Dependabot opens grouped minor and patch PRs weekly. Merge them when `validate` is green; read the changelog for anything that touches auth, crypto, or the map. Major bumps get their own branch and a note in the PR about what was checked by hand.
