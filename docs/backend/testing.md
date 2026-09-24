---
title: Backend testing
description: The API test stack, the test layout and helpers, what every route test must include, and the first-run download.
sidebar_position: 5
---

# Backend testing

Status: **Scaffolded 2026-09-24**

vitest runs the suite, supertest drives the Express app returned by `buildApp`, and `mongodb-memory-server` provides a real MongoDB per run. No database mocks: schema validation, unique indexes, TTL fields, and `2dsphere` queries all execute for real, so the suite proves the data layer and not a stand-in for it.

## Layout

```
test/
  helpers/
    app.ts     buildTestApp(): buildApp with a test env and a silent logger
    db.ts      start and stop the memory server, drop the database between files
    auth.ts    createUser(), asMember(app), asAdmin(app): register and return a Bearer token
  routes/
    auth.test.ts
    places.test.ts
    healthz.test.ts
    stats.test.ts
  services/
    cursor.test.ts
    crypto.test.ts
vitest.config.ts   globalSetup starts one memory server, each test file gets its own database name
```

Route tests sit under `test/routes/` and are named after the router file they cover. Pure functions in `lib/` and `services/` get unit tests under `test/services/`. Fixtures are built in the test through the API where possible (register a user, create a place) so a test exercises the same path a client would.

## What every route test includes

| Case | Assert |
|---|---|
| Happy path | status, the envelope shape, and that the response contains only the fields the API documents |
| Validation error | `400`, `error.code === 'validation_error'`, and a `details[].path` naming the bad field |
| Unauthenticated | `401 unauthenticated` with no token, and with an expired or garbage token |
| Wrong principal or role | a second user, or a member on an admin route: `403`, or `404` where existence must not leak |
| Visibility filtering | create items the caller may and may not see, list, and assert the hidden ones are absent |

The last two cases are the permission boundary. A route test without them is incomplete regardless of what else it covers. For places specifically: a `pending` place never appears in `GET /api/places` for a member, does appear in `GET /api/admin/places/pending` for an admin, and returns `404` from `GET /api/places/:slug` until approved.

Example shape:

```ts
it('hides pending places from the public list', async () => {
  const admin = await asAdmin(app);
  const member = await asMember(app);
  await member.post('/api/places').send(validPlace).expect(201);
  const res = await request(app).get('/api/places?bbox=-119,33,-117,35').expect(200);
  expect(res.body.items).toHaveLength(0);
  await admin.get('/api/admin/places/pending').expect(200);
});
```

## Running

```bash
npm test                                   # the whole suite, what validate runs
npx vitest run test/routes/places.test.ts  # one file
npx vitest test/routes/places              # watch mode on a pattern
npx vitest run -t 'hides pending'          # one test by name
```

Tests log nothing (`LOG_LEVEL` is forced to `silent` under `NODE_ENV=test`). Set `LOG_LEVEL=debug` explicitly when chasing a failure.

## First run

`mongodb-memory-server` downloads a MongoDB binary (around 100 MB) into its cache directory the first time it runs on a machine, and again when the pinned version changes. On a slow connection the first test file can exceed the hook timeout; `vitest.config.ts` sets `hookTimeout` high enough for the download, and CI caches the binary directory keyed on the package lock so it downloads once per version. If the first run fails with a download error, run it again; a partial download is retried, not reused.

On Windows the binary is cached per user, and antivirus scanning of the extracted binary can add a few seconds to startup. Nothing in the tests depends on the platform.

## What the scaffold suite covers

Auth (register, login, magic-link issue and verify, sessions list and revoke, me, delete), places (bbox list, get by slug, create pending, admin approve and reject), healthz, stats, and the cursor and crypto helpers. The 501 stubs have one test each asserting the status and code, so a route that is accidentally left unmounted fails.
