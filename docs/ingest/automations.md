---
title: Automations
description: The two scheduled jobs that keep the library and the events list fresh, written as cron entries with the exact commands, environment, success signals and stop conditions, for the media bot (OpenClaw) and the events bot (grokbot).
sidebar_position: 8
---

# Automations

Status: **Updated 2026-10-06**

Four jobs, one contract. The media job belongs to the personal assistant (OpenClaw); the events job belongs to the ingest bot (grokbot). Both run the scripts in the API repository against the same ingest endpoint, both hold only `INGEST_KEY`, and neither publishes anything: rows land `draft` or `pending` unless the source is on the trusted list, and a person moves them. The [runbook](/ingest/bot-runbook) is the operating procedure; this page is the schedule and the exact invocation.

## The manifest

Everything on this page is also published as one JSON file for a bot to read: [`/automations.json`](/automations.json). It carries the repository, the Node version, the environment each job needs, every job's cron line and command list, the success signal, the stop conditions, and the never list. A bot that polls it daily picks up a new job or a changed command without a person editing its configuration. The page is the explanation; the file is the source of truth when they differ.

## How a bot picks a job up

1. Clone or update the API repository (`main`) and `npm ci` (Node 24). No database connection string is needed; every script POSTs to the ingest endpoint.
2. Export the environment in the table for that job. Nothing else. The ingest `User-Agent` is built into the scripts; there is no variable for it.
3. Confirm `GET /healthz` answers `{ "ok": true }`.
4. Run the commands in order. Every script prints one JSON summary line (`inserted`, `updated`, `unchanged`, `rejected`) on success and exits non-zero on failure.
5. Post the summary lines where the maintainer reads them. Never post item bodies or the key.

The `cron` lines below are the schedule in one place. Times are Pacific; the API host is in `America/Los_Angeles`. Jobs never overlap.

## Job 1: media refresh (OpenClaw)

Purpose: keep every title's providers, posters, ratings and trailer current, discover new films about the cause, and re-seed the shelves. Never publishes, never touches a member.

```cron
# media refresh, weekly, Sunday 03:30 Pacific
30 3 * * 0  cd $VG_API && npm run --silent ingest:media:seed && npm run --silent ingest:media:wikidata && npm run --silent ingest:media:tmdb
```

| Step | Command | What it does | Trusted? |
|---|---|---|---|
| 1 | `npm run --silent ingest:media:seed` | posts the curated seed (`scripts/data/media-seed.json`): titles, ids, topic tags, warnings, official sites, free official streams, actions | yes, source `curated` publishes |
| 2 | `npm run --silent ingest:media:wikidata` | runs the SPARQL discovery for films whose subject is veganism, animal rights, intensive animal farming or animal welfare; writes the cache the next step reads | no, source `wikidata` lands `draft` |
| 3 | `npm run --silent ingest:media:tmdb` | one TMDB call per film with videos, credits and release dates appended, then providers; uploads poster and backdrop when the bucket role is present, otherwise sends the rest | re-sends under the original source, so the moderation state is unchanged |

Environment for this job:

| Variable | Value |
|---|---|
| `API_URL` | the API origin |
| `INGEST_KEY` | the ingest key, from the maintainer, never from a repository |
| `TMDB_API_KEY` | a TMDB read key; without it step 3 exits early with a clear message and the job still counts as run |

Success signals: step 1 answers `200` with every item `unchanged` or `updated` (a rejection means the seed file broke; stop and report the `rejected[]` entry). Step 3 reports `posters` equal to the number of items with a TMDB id when the bucket role is present, otherwise 0 and a warning.

Stop conditions, beyond the runbook's: TMDB answering `401` (rotate the key), or the Wikidata step returning zero results two weeks running (the query service changed; a person reviews the SPARQL on the [media page](/ingest/media)).

What the job must never do: hot-link an image, send `featured`, `status`, `stats` or any field not in the media item schema, or run `seed:media:collections` (that step needs the database and runs on the API host through the [data refresh](/ingest/media#the-data-refresh-on-the-host), not from a bot).

## Job 2: events refresh (grokbot)

Purpose: pull every upcoming event from the organisations on the allowlist, expand recurrences, and land them so the events list and map stay current. Daily, because events change daily.

```cron
# events refresh, daily, 04:15 Pacific
15 4 * * *  cd $VG_API && npm run --silent ingest:events:ics && npm run --silent ingest:events:jsonld && npm run --silent ingest:events:mobilize && npm run --silent ingest:events:tribe && npm run --silent ingest:events:json && npm run --silent ingest:events:dxe
```

| Step | Command | Sources today | Trusted? |
|---|---|---|---|
| 1 | `npm run --silent ingest:events:ics` | Sale Ranch Animal Sanctuary | yes |
| 2 | `npm run --silent ingest:events:jsonld` | Kindred Spirits Care Farm, The Open Barn, Martha's Farm Animal Sanctuary, Pebble Ranch Rescue; the Animal Rights Calendar listings for Los Angeles and San Diego (Cubes of Truth, LA Animal Defense League, LA Animal Victory Meetup, Save vigils) | sanctuaries yes; the calendar lands `pending` because activists submit to it |
| 3 | `npm run --silent ingest:events:mobilize` | The Humane League (public Mobilize feed; California and virtual events only) | yes, `PUBLIC` and `APPROVED` events only |
| 4 | `npm run --silent ingest:events:tribe` | Plant Based Treaty (The Events Calendar REST) | yes |
| 5 | `npm run --silent ingest:events:json` | Sea Shepherd (its own static events file; California only) | yes |
| 6 | `npm run --silent ingest:events:dxe` | Direct Action Everywhere chapters; every entry is `enabled: false` until the owner decides, so the step logs four skips and exits clean | no, `pending` if ever enabled |

Sources that exist in the allowlist but are switched off until the owner decides are listed on the [events page](/ingest/events#decisions-awaiting-the-owner): Direct Action Everywhere's chapter feed (its data is synced from Facebook by DxE itself), the Vegan Street Fair listing on a ticketing platform, and the San Diego VegFest calendar, which mixes in non-vegan events and needs its title filter confirmed.

Environment for this job:

| Variable | Value |
|---|---|
| `API_URL` | the API origin |
| `INGEST_KEY` | the ingest key |

Success signals: each step's summary has `rejected` at zero and `inserted` plus `updated` at most a few dozen. The daily count of upcoming events on `GET /api/stats` should never drop to zero while a source has events.

Stop conditions, beyond the runbook's: a source's `robots.txt` newly disallowing its path; a feed whose item count moved more than 25 percent since the last run; Mobilize or the Sea Shepherd file changing shape (the mappers fail closed and report `rejected`).

What the job must never do: read attendee counts, organiser people, contact fields or RSVP data from any source (the mappers drop them by construction and the tests prove it); follow a link to Facebook, Instagram, Meetup or Eventbrite; call DxE's `chapters` endpoint; or add a source. New sources arrive as a pull request to the allowlist with a `--dry-run` count, per the [events page](/ingest/events).

## Job 3: organizations and guides (grokbot)

Purpose: refresh the curated organization directory and land any new curated guides as drafts. Monthly; both files change rarely.

```cron
# organizations and guides, monthly, the 1st at 05:00 Pacific
0 5 1 * *  cd $VG_API && npm run --silent ingest:organizations && npm run --silent ingest:guides
```

Environment: `API_URL` and `INGEST_KEY`. Success: both steps exit 0 with `rejected` at zero. Guides always land `draft`; a person publishes.

## Job 4: places refresh (grokbot)

Purpose: re-read OpenStreetMap for every vegan place, community garden and curated sanctuary so hours, phone numbers and new openings stay current. Quarterly, because the data moves slowly and the Overpass service is shared with everyone.

```cron
# places, quarterly, the 2nd of January, April, July and October at 06:00 Pacific
0 6 2 1,4,7,10 *  cd $VG_API && npm run --silent ingest:places:osm -- --dry-run && npm run --silent ingest:places:osm && npm run --silent ingest:places:gardens && npm run --silent ingest:places:curated
```

Environment: `API_URL` and `INGEST_KEY`. The scripts talk to the ingest endpoint like every other job; OSM is on the trusted list, so refreshed rows publish, and the curated file is the source for sanctuaries and gardens. The dry run comes first on purpose: its count must sit within 25 percent of the last real run, or the job stops and reports. Allow up to two hours; Overpass is queried one tile at a time at one request per second, and the importer gives up on its own when the service is not answering, which is a "try tomorrow", not an alert.

## Adding a job

A third job (guides, organisations, places) follows the same shape: one `cron` line, the commands in order, the environment table, success signals, stop conditions, and the never list. The [runbook](/ingest/bot-runbook) already gives the cadence for those resources.
