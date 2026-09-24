---
title: Pre-commit hooks
description: What husky and lint-staged run on every commit in each repo, and why a secretlint finding is a stop, not a bypass.
sidebar_position: 5
---

# Pre-commit hooks

Status: **Scaffolded 2026-09-24**

Every repo has a husky `pre-commit` hook that runs lint-staged. Two things happen to every commit before it exists: Biome rewrites the staged code files, and secretlint reads every staged file of any type. The hook is installed by `npm install` through the `prepare` script, so a fresh clone gets it without a setup step.

## The hook

`.husky/pre-commit` is one line:

```bash
npx lint-staged
```

lint-staged is configured in each `package.json`. The code glob differs per repo because the file types differ; the secretlint line is identical everywhere.

| Repo | Biome runs on | secretlint runs on |
|---|---|---|
| `vegan-grove-api` | `*.{ts,js,json}` | `*` |
| `vegan-grove-web` | `*.{ts,tsx,js,json,css}` | `*` |
| `vegan-grove-mobile` | `*.{ts,tsx,js,json}` | `*` |
| `vegan-grove-docs` | `*.{ts,tsx,js,json,css}` | `*` |

```json
"lint-staged": {
  "*.{ts,tsx,js,json,css}": "biome check --write",
  "*": "secretlint"
}
```

`biome check --write` formats, sorts imports, and applies safe lint fixes, then re-stages the result. An unfixable lint error (an unused import in a file you did not touch does not count; only staged files are checked) fails the commit with the same output `npm run lint` would give.

## secretlint

`.secretlintrc.json` loads `@secretlint/secretlint-rule-preset-recommend`: AWS keys, private keys, GitHub and Slack tokens, database connection strings with credentials, npm tokens, and generic high-entropy patterns. Because the glob is `*`, it reads Markdown, YAML, `.env.example`, shell scripts, and images too (binaries are skipped by content type).

This is the working-tree half of the secrets defense. gitleaks in CI is the history half. Both exist because a hook can be skipped by a tool that commits without invoking it; CI cannot be skipped.

## A finding is a stop

There is no approved way to bypass the hook. `git commit --no-verify` is not used in these repos, and a PR whose history shows a commit that could only have been made that way is closed.

When secretlint fires:

1. Read the finding. If it is a real credential, it is already compromised in your working tree and possibly your shell history: rotate it now, before anything else.
2. Move the value to `.env` (gitignored) and reference it by name. `.env.example` carries names and one comment each, never values.
3. If it is a false positive (an example key in docs, a test fixture), add a narrow `allows` entry to `.secretlintrc.json` in the same commit, with a comment saying why, and call it out in the PR summary. Broad allowlists are a review failure.

The reason for the hard line is in the [threat model](/privacy/threat-model): the repos are public, and The Trick Book shipped Atlas credentials, an admin JWT, and a CDN key to public git through exactly the "just this once" path.

## Related

- [Linting and formatting](/engineering/linting-formatting) for what Biome enforces.
- [Development workflow](/engineering/development-workflow) for what happens when the `secrets` CI job fails.
