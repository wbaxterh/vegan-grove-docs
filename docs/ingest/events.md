---
title: Ingest events
description: How events are ingested from allowlisted organizations' ICS feeds and schema.org Event JSON-LD, the field mapping, type inference, host resolution, and what is forbidden.
sidebar_position: 3
---

# Ingest events

Status: **Proposed 2026-09-29**

Events come only from organizations on an allowlist, `scripts/data/event-sources.json` in the API repo. Two scripts read it: `ingest:events:ics` for calendar feeds and `ingest:events:jsonld` for pages that embed schema.org `Event` data. Both POST to `POST /api/ingest/events` under the [contract](/ingest). An event listing is public data; who attends is not, and no attendee field is ever read.

## The allowlist

```json
{
  "sources": [
    {
      "id": "ics:farmsanctuary",
      "org": "Farm Sanctuary",
      "kind": "ics",
      "url": "https://example.org/events.ics",
      "defaultType": "sanctuary_day"
    },
    {
      "id": "jsonld:gentlebarn",
      "org": "The Gentle Barn",
      "kind": "jsonld",
      "url": "https://example.org/events",
      "defaultType": "sanctuary_day"
    }
  ]
}
```

`id` is the item's `source`. `org` is the `hostName`. ICS comes first: it is the org's own published calendar and it changes less. JSON-LD is for an org that has no feed but marks up its event pages.

## Mapping to the event item

| Event item | ICS (RFC 5545) | JSON-LD `Event` |
|---|---|---|
| `sourceId` | `UID`, plus `/` and the instance `DTSTART` when the event has an `RRULE` | `@id`, else the `url` |
| `title` | `SUMMARY` | `name` |
| `type` | inferred, else the source's `defaultType` | inferred, else `defaultType` |
| `startsAt` | `DTSTART` as ISO 8601 with the `TZID` offset | `startDate` |
| `endsAt` | `DTEND`, else `DTSTART` plus two hours | `endDate`, same fallback |
| `venueName` | first line of `LOCATION` | `location.name` |
| `address` | remaining lines of `LOCATION` | `location.address` joined |
| `location { lng, lat }` | `GEO`, else geocoded from `address` with Nominatim (one request per second, cached) | `location.geo`, else geocoded |
| `description` | `DESCRIPTION`, HTML stripped, at most 4000 characters | `description`, same |
| `hostName` | the allowlist `org` | the allowlist `org` |
| `sourceUrl` | `URL`, else the feed page from the allowlist | `url` |
| `visibility` | `public` | `public` |

Recurring events are expanded 90 days ahead. Events that already ended are not sent. Cancelled items (`STATUS:CANCELLED`, `eventStatus: EventCancelled`) are not sent; an event sent earlier that later disappears stays listed until its date passes, and an admin cancels it if needed.

`ORGANIZER`, `ATTENDEE`, a JSON-LD `organizer` that is a `Person`, and `attendee` are never read. `hostName` always comes from the allowlist, not from the feed.

An event without coordinates is stored without a point. It appears in lists but not on the map until an admin adds one.

## Type inference

Keywords in the title, checked in this order. First match wins.

| Keywords | `type` |
|---|---|
| vigil | `vigil` |
| cube, outreach, leaflet, tabling | `outreach` |
| potluck, dinner, brunch | `potluck` |
| tour, volunteer, work day, sanctuary | `sanctuary_day` |
| screening, film, documentary | `screening` |
| protest, march, rally, demonstration, disruption | `protest` |
| meeting, orientation, training | `meeting` |
| none | the source's `defaultType`, else `other` |

## Host resolution

`hostName` is slugified and matched to `organizations.slug`. A match sets `hostType: organization` and `hostId`. No match creates an organization `{ name, slug, type: org, verified: false }` with the same `source` and `sourceId` equal to the slug, so the event still has a host and an admin can verify it later. Ingested events have no `createdBy`; provenance identifies them.

## Forbidden

- Facebook, Instagram, Meetup, and Eventbrite HTML. Their terms forbid it and the pages carry personal accounts.
- Attendee data of any kind: counts, names, handles, RSVPs from the source.
- Sources not on the allowlist, even when they publish an ICS feed.

## Adding a source

The bot does not edit the allowlist at runtime. It opens a pull request to `scripts/data/event-sources.json` with the feed URL, the organization's name as written on its own site, and the `--dry-run` count in the PR description. A person merges it. The next daily run picks it up.

## Cadence

Daily. Each run fetches every source, expands recurrences, runs `--dry-run` once for a source that is new, POSTs in batches of at most 200, and reads the `207` rejections per the [runbook](/ingest/bot-runbook).
