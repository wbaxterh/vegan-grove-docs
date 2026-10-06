---
title: Bot runbook
description: The literal schedule, environment, order of operations, retry rules, and stop conditions for the automation that runs Vegan Grove's ingest.
sidebar_position: 7
---

# Bot runbook

Status: **Proposed 2026-09-29**

This page is the operating procedure for the automation (working name grokbot) that runs ingest on a schedule. It assumes the [contract](/ingest) and the resource pages have been read. Where this page and a resource page disagree, the resource page wins on mapping and this page wins on operations.

## Schedule

| Run | Scripts, in order | Cadence |
|---|---|---|
| Events | `ingest:events:ics`, `ingest:events:jsonld`, `ingest:events:mobilize`, `ingest:events:tribe`, `ingest:events:json`, `ingest:events:dxe` | daily, early morning Pacific |
| Organizations and guides | `ingest:organizations`, `ingest:guides` | monthly, day 1 |
| Media | `ingest:media:seed`, `ingest:media:wikidata`, `ingest:media:tmdb` | weekly, Sunday |
| Places | `ingest:places:osm` (dry run, then real), `ingest:places:gardens`, `ingest:places:curated` | quarterly, the 2nd of January, April, July, October |

The exact cron lines and commands live on the [automations page](/ingest/automations) and in [`/automations.json`](/automations.json).

Runs never overlap. One resource at a time, in the order listed within a day.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `INGEST_KEY` | yes | sent as `X-Ingest-Key`. The only credential the bot holds. |
| `API_URL` | yes | the API origin the scripts POST to |
| `TMDB_API_KEY` | for `ingest:media:tmdb` only | TMDB read access |

The descriptive `User-Agent` for every outbound fetch is built into the scripts; nothing to configure.

The bot has no session token, no admin role, no database connection string, no bucket role, and no access to any member table. If any of those is offered to it, the offer is a misconfiguration and the bot stops.

## Order of operations, per run

1. Confirm `GET /healthz` returns `{ ok: true }`. If not, wait ten minutes and retry twice, then alert.
2. Fetch the source, respecting `robots.txt` and the source's own rate limit (Nominatim and Wikidata: one request per second).
3. Build items. Drop any item that fails its resource page's rules before sending: no name, no coordinates on a place, a `fast_food` place with vegan options only.
4. If the source is new or the script changed, run with `--dry-run` and compare the printed counts to the last real run. A count that moved more than 25 percent is an alert, not a run.
5. POST in batches of at most 200 items, no more than one batch every 15 seconds (60 calls per 15 minutes is the ceiling; stay under it).
6. Read every response. Sum `inserted`, `updated`, `unchanged`, and the length of `rejected` across batches.
7. Log the sums with the source id and the run time. Never log item bodies or the key.

## Idempotency

Every item carries a stable `sourceId`, and the API upserts on `(source, sourceId)`. Re-sending a batch is safe: the result is `unchanged` for rows already stored. A run that dies halfway is restarted from the first batch, not resumed. Nothing the bot sends can delete a row.

## Responses

| Status | Meaning | Action |
|---|---|---|
| `200` | every item written | continue |
| `207` | some items rejected | continue; record each `rejected[]` entry with its `index`, `sourceId`, and `errors`; fix the mapping before the next run |
| `400` | the envelope is wrong: no `source`, more than 200 items, not JSON | stop the run, alert. Nothing was written. |
| `401` | wrong key | stop immediately, do not retry, alert |
| `429` | rate limit | wait `Retry-After` seconds, resend the same batch |
| `503` | ingest not configured on the API | stop the run, alert, do not retry within the hour |
| other `5xx` | server fault | back off 30, 60, 120 seconds, three tries, then stop and alert |

`207` on a bad mapping is the normal way a mistake shows up. Rejections count per run, not per batch, for the threshold below.

## Stop and alert a human

- Rejection rate above 10 percent of the items in a run.
- Any `401`.
- Any `503`, or three failed `5xx` retries.
- `GET /healthz` failing on the third try.
- A dry-run count that moved more than 25 percent since the last run.
- A source whose `robots.txt` now disallows the path.

Alerting means writing the run summary (source, counts, the first five rejections, the HTTP status) where the maintainer reads it, and not running that source again until a person clears it.

## Never

- Never hold or ask for member data, a session token, an admin role, a database string, or a bucket credential. `INGEST_KEY` is the whole permission set.
- Never scrape Facebook, Instagram, Meetup, or Eventbrite HTML.
- Never send attendee, RSVP, organizer-person, or any other personal field.
- Never hotlink an image or send an image URL as `posterKey`.
- Never run a script against production without a `--dry-run` first on a new source.
- Never add a source by writing to the allowlist directly; open a pull request.
- Never retry a `401`.
- Never log the key, a request body, or a full item.
- Never publish, approve, or verify anything. Those are admin actions; the bot lands rows and stops.
