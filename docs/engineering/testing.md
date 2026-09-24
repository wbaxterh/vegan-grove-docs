---
title: Testing
description: What is tested in each repo, what a route test must cover, and which checks run inside validate.
sidebar_position: 4
---

# Testing

Status: **Scaffolded 2026-09-24**

The API is where correctness matters most, so it carries the real test suite. The clients get a smoke test and a release guard. The docs build is its own test. Nothing ships without `npm run validate`, and each repo's `validate` includes exactly the tests that are fast and deterministic enough to run on every PR.

## API: vitest, supertest, mongodb-memory-server

Tests boot the Express app through `buildApp` (no listener) and hit it with supertest against a MongoDB started in-process by `mongodb-memory-server`. No mocks of the database: the same Mongoose models, indexes, and TTL definitions run in tests as in production, so a missing unique index fails a test instead of a member.

Every route file has a test file, and every route test includes, at minimum:

| Case | Expects |
|---|---|
| Happy path | the documented status and response shape |
| Validation error | `400`, `code: 'validation_error'`, the field path in `details` |
| Unauthenticated | `401` on member routes |
| Wrong principal or role | `403`, or `404` where existence must not leak |
| Visibility filtering | a list never contains an item the caller may not see |

The last two are the **permission boundary** and they are not optional. A PR that adds a route without them fails review regardless of coverage. The [backend testing](/backend/testing) page has the layout, the helpers, and the first-run download note.

## Web: Playwright smoke, outside `validate`

`test:e2e` runs Playwright against a local `next start`: the home page renders, `/places` mounts the map container, `/login` shows the form. It is not in `validate` because it needs a built app and a browser, which doubles CI time for a check that catches a different class of bug (a dynamic import that broke, a layout that threw on the server). Run it before a web release and after touching the map or the session route handler.

`validate` for web is Biome, `tsc`, and `next build`. The build is a real test: it renders every static route, type-checks route handlers, and fails on a bad `metadata` export.

## Mobile: typecheck and the release guard

There is no unit suite in the scaffold. `validate` is Biome, `tsc --noEmit`, and `check:prod`, the script that fails on `localhost`, live keys, and private IP ranges in the source tree. `tsc` over an expo-router app catches most of what a shallow component test would, and the release guard catches the mistake that actually ships to a store. See [build and release](/mobile/build-and-release).

## Docs: the build is the test

`docusaurus build` with `onBrokenLinks: 'throw'` and a required `description` on every page means a wrong link, a missing frontmatter field, or a Mermaid diagram that does not parse fails CI. `pokedocs check` runs the preset's own checks first. There is nothing else to test in a docs repo, and adding a test framework would be decoration.

## What is not tested yet

Socket.IO event flows (the `/messages` namespace has a client in devDependencies, tests land with the messages milestone), the companion SSE stream beyond a stubbed model, and the OSM seed script. These are listed in [open questions](/roadmap/open-questions).
