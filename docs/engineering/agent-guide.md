---
title: Agent guide
description: How AI coding agents are expected to work in the Vegan Grove repos, and where the docs expose themselves to agents.
sidebar_position: 8
---

# Agent guide

Status: **Scaffolded 2026-09-24**

Much of this codebase is written with AI coding agents. The repos are set up so an agent gets the same instructions a person would, in the same order, and so the checks that matter cannot be talked around.

## Read order

Every repo has `AGENTS.md` at the root and a `CLAUDE.md` containing only `@AGENTS.md`, so any agent that reads either file lands on the same text. The order is fixed:

1. `SOUL.md`: what the product is and the three forces (compassion, action, community).
2. `PRODUCT-PRINCIPLES-CHECKLIST.md`: the checklist worked through before proposing completion.
3. Then implement.

`AGENTS.md` ends with a repo-specific section: where the layout is described, which script runs the tests, what the repo must never contain. For the API that section points at [backend overview](/backend/overview); for the clients, at [mobile](/mobile/overview) and [web](/web/overview).

## Non-negotiables, restated for agents

- Privacy first. A new field means a new row in the [data inventory](/privacy/data-inventory) in the same change. Profiles are never public. Nothing personal reaches [logs](/engineering/logging) or third parties.
- The principal comes from the session, never from a request body.
- Every list is filtered by visibility on the server before it is returned.
- Shared tokens only: `--vg-*` in web CSS, `src/theme/tokens.ts` in mobile. No new hex values in components, no third-party fonts or icon CDNs.
- Smaller scope with tests beats larger scope without. When uncertain, choose the smaller scope and ask.
- Never write an infrastructure identifier into a file: no host, IP, instance id, port, PEM name, process name, or SSH command. The [disclosure policy](/privacy/disclosure-policy) is binding on generated docs too.

## The completion triple

Before proposing that a change is done, an agent runs `npm run validate` and states three things: what activist outcome improved, what privacy and trust checks were run, and what signal should be monitored. These are the first, third, and fourth lines of the PR summary block; the agent's completion message should be pasteable into it.

## secretlint is a stop

The pre-commit hook runs secretlint on every staged file. An agent that sees a finding does not retry with `--no-verify`, does not widen the allowlist, and does not rewrite the value to dodge the pattern. It stops, reports the finding, and waits. See [pre-commit hooks](/engineering/pre-commit-hooks).

## Commits

Conventional subjects. Agent-assisted commits are authored by the maintainer; the agent stages and hands off. Squash merges into `main` with `validate` green.

## The docs' own agent surface

This site is built to be read by agents as well as people:

- `/llms.txt` at the site root lists every page with its one-sentence `description`, in sidebar order.
- Every page has a `.md` twin at the same path with the extension (`/engineering/agent-guide.md`) serving the raw Markdown, so an agent can fetch a page without parsing HTML.
- The `description` frontmatter field is required by the build for exactly this reason: it is what the index and the twins lead with.

When you add a page, write the description as the sentence you would want an agent to see when deciding whether to open it.
