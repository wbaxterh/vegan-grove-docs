---
title: Engineering overview
description: The tooling baseline every Vegan Grove repo shares, and what the validate script means in each one.
sidebar_position: 1
---

# Engineering overview

Status: **Scaffolded 2026-09-24**

Four repos, one baseline. Every repo carries the same governance files (`SOUL.md`, `PRODUCT-PRINCIPLES-CHECKLIST.md`, `AGENTS.md`, `CODEOWNERS`, the PR template) and the same tooling, so switching between them costs nothing and a rule learned once holds everywhere. The [repo dependency map](/architecture/repo-dependency-map) shows how they relate; this page is about how they are kept honest.

## The baseline

| Concern | Tool | Where it runs |
|---|---|---|
| Lint and format | Biome 2.5.x, one shared `biome.json` | editor, pre-commit, CI |
| Pre-commit | husky + lint-staged | every commit |
| Secrets in the working tree | secretlint on every staged file | every commit |
| Secrets in history | gitleaks | CI, full history |
| Dependencies | Dependabot, weekly, minor and patch grouped | GitHub |
| Contract | `npm run validate` | local before a PR, CI on every PR |
| Commit subjects | Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`) | review |
| Merge | Squash into `main` | GitHub |
| Branch protection | ruleset: PR only, code-owner review, `validate` required, admin bypass | GitHub |

The admin bypass exists because there is one maintainer. It lets a solo merge happen without a second reviewer; it does not skip `validate`, and the PR summary block is still filled in. See the [development workflow](/engineering/development-workflow).

## What `validate` means per repo

`validate` is the CI contract. CI does nothing you cannot run locally, and CI runs nothing else. If it is green on your machine it is green in CI, and the reverse.

| Repo | `validate` runs | Not in `validate` |
|---|---|---|
| `vegan-grove-api` | `biome check`, `tsc --noEmit`, `vitest run`, `tsc -p tsconfig.build.json` | seed scripts |
| `vegan-grove-web` | `biome check`, `tsc --noEmit`, `next build` | Playwright smoke (`test:e2e`) |
| `vegan-grove-mobile` | `biome check`, `tsc --noEmit`, `check:prod` (release guard) | EAS builds |
| `vegan-grove-docs` | `biome check`, `tsc`, `pokedocs check`, `docusaurus build` | nothing |

Details: [linting and formatting](/engineering/linting-formatting), [testing](/engineering/testing), [pre-commit hooks](/engineering/pre-commit-hooks).

## CI shape

`.github/workflows/ci.yml` has two jobs on every pull request to `main`: `validate` (Node from `.nvmrc`, `npm ci`, `npm run validate`) and `secrets` (gitleaks over the full history). The docs repo adds a cached Playwright chromium step because Mermaid renders to SVG at build time. `validate` is the required status check in the ruleset. A gitleaks finding is handled as an incident, not a red X to retry.

## What is deliberately absent

No Docker in any repo (the API runs under PM2 on one host, see [backend deployment](/deployment/backend)). No ESLint or Prettier next to Biome. No error-tracking SaaS: errors are logged locally by [pino](/engineering/logging), because a hosted tracker with request context is a third party holding member data. No coverage gate yet; the [testing](/engineering/testing) page says what every route test must include instead.
