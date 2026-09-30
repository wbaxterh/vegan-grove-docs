---
title: Ingest events
description: How events are ingested from allowlisted organizations' ICS feeds, schema.org Event JSON-LD, the Mobilize and The Events Calendar APIs, static JSON files and DxE's chapter database; the field mappings, what is never read, trust tiers, and the policy decisions still open.
sidebar_position: 3
---

# Ingest events

Status: **Updated 2026-09-30**

Events come only from organizations on an allowlist, `scripts/data/event-sources.json` in the API repo. Six scripts read it, one per route kind: `ingest:events:ics` (calendar feeds), `ingest:events:jsonld` (pages that embed schema.org `Event` data, including list pages that link to detail pages), `ingest:events:mobilize` (the Mobilize public API), `ingest:events:tribe` (The Events Calendar REST API on WordPress sites), `ingest:events:json` (a static JSON file behind an organization's own events page, one named mapper per site) and `ingest:events:dxe` (Direct Action Everywhere's chapter database). All six POST to `POST /api/ingest/events` under the [contract](/ingest); every outbound request carries the ingest `User-Agent`, honours `robots.txt` (a `403` or `404` answer counts as absent) and is paced to one request per second per host. An event listing is public data; who attends is not, and no attendee field is ever read.

## The allowlist

```json
[
  { "source": "ics:saleranch", "hostName": "Sale Ranch Animal Sanctuary", "ics": "https://example.org/events/?ical=1" },
  { "source": "jsonld:openbarn", "hostName": "The Open Barn", "url": "https://example.org/event", "detailLinkPattern": "^/event-details-registration/" },
  { "source": "mobilize:thehumaneleague", "kind": "mobilize", "hostName": "The Humane League", "organizationId": 26695, "sourceUrl": "https://www.mobilize.us/thehumaneleague/" },
  { "source": "tribe:plantbasedtreaty", "kind": "tribe", "hostName": "Plant Based Treaty", "url": "https://example.org/wp-json/tribe/events/v1/events", "sourceUrl": "https://example.org/events/" },
  { "source": "json:seashepherd", "kind": "json", "mapping": "seashepherd", "hostName": "Sea Shepherd Conservation Society", "url": "https://example.org/events.json", "sourceUrl": "https://example.org/events/" },
  { "source": "dxe:losangeles", "kind": "dxe", "hostName": "Direct Action Everywhere Los Angeles", "pageId": "153660568381244", "sourceUrl": "https://www.directactioneverywhere.com/events", "enabled": false, "decision": "Facebook-derived; awaiting the owner's call." }
]
```

The file is a flat array. `source` is the item's `source` (the value `TRUSTED_SOURCES` matches); `hostName` is the `hostName` of every item and never comes from the feed. `kind` picks the script (`ics`, `jsonld`, `mobilize`, `tribe`, `json`, `dxe`); the first entries have no `kind` and are routed by whether they carry `ics` or `url`.

| Field | Meaning |
|---|---|
| `ics` | feed URL (`ics`) |
| `url` | list page (`jsonld`), REST endpoint (`tribe`) or JSON file (`json`) |
| `detailLinkPattern` | regex matched against the path of same-origin links on the list page; the matching pages carry the Event JSON-LD |
| `maxPages` | detail pages fetched per list page; lowers the crawl cap of 50, never raises it |
| `titleFilter` | case-insensitive regex an event title must match to be kept; every script applies it before mapping |
| `defaultType` | the type used when no keyword matches; `other` when absent |
| `enabled` | `false` parks the entry; every script skips it and logs `source skipped` with `reason: disabled` |
| `placeholder` | a note that the source publishes nothing usable yet; skipped with `reason: placeholder` |
| `organizationId` | Mobilize organization id (`mobilize`) |
| `pageId` | DxE chapter page id, digits only (`dxe`) |
| `mapping` | the named mapper for a static file (`json`); today `seashepherd` |
| `region` | `any` keeps events outside California (`json`); the default keeps California only |
| `sourceUrl` | the organization's public events page: an item's link when the feed gives none of its own |
| `trust`, `scope`, `decision`, `verified`, `notes` | documentation only; the moderation tier is set by `TRUSTED_SOURCES` on the API |

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
| `location { lng, lat }` | `GEO`, else absent (stored without a map pin) | `location.geo`, else absent |
| `description` | `DESCRIPTION`, HTML stripped, at most 4000 characters | `description`, same |
| `hostName` | the allowlist `org` | the allowlist `org` |
| `sourceUrl` | `URL`, else the feed page from the allowlist | `url` |
| `visibility` | `public` | `public` |

`titleFilter`, when set, is applied to the title before anything else is mapped. Detail links on a list page are followed with their query string stripped (aggregators add `?referrer=` to every href); the `?format=ical` and `?format=json` variants that Squarespace's `robots.txt` disallows are never followed. An ICS URL that answers an empty or non-calendar body (The Events Calendar does this when nothing is upcoming) counts as zero events and does not fail the run.

Recurring events are expanded 90 days ahead. Events that already ended are not sent. Cancelled items (`STATUS:CANCELLED`, `eventStatus: EventCancelled`) are not sent; an event sent earlier that later disappears stays listed until its date passes, and an admin cancels it if needed.

`ORGANIZER`, `ATTENDEE`, a JSON-LD `organizer` that is a `Person`, and `attendee` are never read. `hostName` always comes from the allowlist, not from the feed.

An event without coordinates is stored without a point. It appears in lists but not on the map until an admin adds one.

## Route kinds added in round 2

**`mobilize`.** `GET https://api.mobilize.us/v1/organizations/<organizationId>/events?timeslot_start=gte_now&per_page=100`, following `next` (same host only, at most 20 pages). Kept only when `visibility` is `PUBLIC`, `approval_status` is `APPROVED`, and `location.region` is `CA` or `is_virtual` is true. One item per timeslot that has not ended and starts within 90 days; `sourceId` is `<event id>/<timeslot id>`. Mapping: `title`; `description`, else `summary`; `browser_url` as `sourceUrl` (else the entry's `sourceUrl`); `timeslots[].start_date` and `end_date` (unix seconds) rendered in the event's `timezone`; `location.venue` as `venueName`; `address_lines`, `locality`, `region` and `postal_code` as `address`; `location.location.latitude` and `longitude` as the point; a virtual event with no venue shows `venueName` `Online`. Type: `RALLY` to protest, `VISIBILITY_EVENT` to outreach, `MEETING`, `MEET_GREET` and `WORKSHOP` to meeting; anything else (including `COMMUNITY`) by keywords, then `defaultType`. Never read: `contact`, `created_by_volunteer_host`, `sponsor`, any attendee or attendance field.

**`tribe`.** `GET <url>?per_page=50&start_date=now&page=n` up to `total_pages` (cap 10). `{ events: [] }` and `{ events: null }` are valid empty answers. Only `status: publish`. Mapping: `title`; `description` with HTML stripped; `url` as `sourceUrl`; `utc_start_date` and `utc_end_date` rendered in the event's `timezone`, else `start_date` and `end_date` read as wall clock in that timezone; `venue.venue` as `venueName`; `venue.address`, `city`, `stateprovince` and `zip` as `address`; `venue.geo_lat` and `geo_lng` as the point (an empty `venue` means no place); `sourceId` is `global_id`, else `id`, else `url`. Never read: `organizer`, `venue.phone`.

**`json`** (`mapping: seashepherd`). Reads `upcoming[]` only. Mapping: `id` as `sourceId`; `title`; `start_iso` (offset included) as `startsAt`, `date` as a fallback; `end_time` (a clock time) on the same local day as `endsAt`, dropped when it lands before the start; `venue` split into `venueName` and `address` with `city_label` appended; `lat` and `lng` as the point; `bring` as the description; type by title keywords first, else `meetup` to meeting and `cleanup` and `benefit` to other, else `defaultType`. Only items whose `city_label` or `venue` contains `, CA` or `California` are kept unless the entry says `region: "any"`. `sourceUrl` is `tickets` only when it is on the organization's own host; otherwise the entry's `sourceUrl`, then `maps_link`. Never read: `leader`, `chapter_email`, `sponsor_name`, `sponsor_url`, `past[]`.

**`dxe`.** `GET https://adb.dxe.io/external_events/<pageId>?start_time=<now minus 1 hour>&end_time=<now plus 180 days>` per chapter, the only URL the script can build (a non-numeric `pageId` is refused, so the chapter endpoint that returns internal fields cannot be called). `{ events: null }` is a valid empty answer. Mapping: `ID` as `sourceId`; `Name`; `Description` with HTML stripped; `StartTime` and `EndTime` (UTC) rendered as Los Angeles; `LocationName` free text, first part as `venueName` and the rest as `address`; `IsCanceled` drops the event; `sourceUrl` is `EventbriteURL` only when it is an https `eventbrite.com` link, else the chapter's `sourceUrl` from the allowlist, never a Facebook URL. No coordinates are sent, so items land without a map pin for an admin to place. Never read: `AttendingCount`, `InterestedCount`, `Cover`, `PageID`, `EventbriteID`, `Lat`, `Lng`, `LastUpdate`.

## Trust tiers

Auto-publish (in `TRUSTED_SOURCES`): the organization publishes its own feed or markup and the host is the organization: `ics:saleranch`, `jsonld:kindredspirits`, `jsonld:openbarn`, `jsonld:marthasfarm`, `jsonld:pebbleranch`, `tribe:plantbasedtreaty`, `mobilize:thehumaneleague`, `json:seashepherd`.

Pending (never in `TRUSTED_SOURCES`): `jsonld:animalrightscalendar-la` and `-sd` (activist-submitted, moderated by Anonymous for the Voiceless, no organizer in the markup, so every item carries the aggregator as host), every `dxe:*` entry (Facebook-derived, free-text addresses, no coordinates), `jsonld:ourhonor` once activated, and anything from Eventeny or Nsefu if approved.

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
- Fetching Eventbrite or Facebook. A feed's own Eventbrite link may be stored as an event's `sourceUrl` (it is never fetched); a Facebook link never is.

## Sources beyond ICS and JSON-LD

A round of research on 2026-09-30 across some fifty national, global and Southern California organisations found that most publish nothing machine-readable (their events live on Facebook, Instagram, Meetup or Eventbrite, which are never read), and that the ones that do fall into five shapes. Two are the feeds above. The other three each get a small script: a public JSON API (Mobilize, used by The Humane League), The Events Calendar's REST endpoint (`wp-json/tribe/events/v1/events`, used by Plant Based Treaty), and a site's own static JSON file (Sea Shepherd). The Animal Rights Calendar, the aggregator behind the Cubes of Truth, is plain JSON-LD once the listing's tracking query strings are stripped from its links. The field mappings and the fields each fetcher must never read are documented with the scripts; the schedule is on the [automations page](/ingest/automations).

The allowlist grew three optional fields: `enabled` (a source switched off stays documented), `titleFilter` (a case-insensitive pattern a title must match, for calendars that mix in unrelated events), and `trust` (a note on why the source is or is not on `TRUSTED_SOURCES`).

## Decisions awaiting the owner

These sources are in the allowlist with `enabled: false` and do not run until a person decides.

| Source | Question |
|---|---|
| Direct Action Everywhere chapters (Los Angeles, Orange County, San Diego, Inland Empire) | DxE serves its chapters' events from its own API, but the rows are synced from Facebook events. The fetcher drops attendee counts and cover images by construction and never calls the chapter endpoint that exposes internal fields; whether Facebook-derived data is acceptable under this policy is the owner's call. If enabled, these land `pending`. |
| Vegan Street Fair on Eventeny | The organisation's own site has no event markup; its listing on a ticketing platform carries valid Festival JSON-LD. Whether a third-party platform page counts as the organisation's own site is undecided, and whether the series URL rolls to the next date is unverified. |
| San Diego VegFest (Nsefu Wildlife Conservation Foundation) | Valid JSON-LD, but the same calendar carries non-vegan events. Enabled only with the `titleFilter` `vegfest|vegan` confirmed, or curated by hand each September. |
| Mercy For Animals, Farm Sanctuary | Events are sold through Eventbrite. Its official API is allowed by the rules but needs a token and an organisation id; neither is set up. |
| Animal Rights Calendar host resolution | One pending source under the aggregator's name (today), or one source per organization page on the calendar if those pages render links server-side (unverified). |
| Our Honor | Activate when its list shows a current event, and confirm that virtual webinars belong in a Southern California events list. |

## Adding a source

The bot does not edit the allowlist at runtime. It opens a pull request to `scripts/data/event-sources.json` with the feed URL, the organization's name as written on its own site, and the `--dry-run` count in the PR description. A person merges it. The next daily run picks it up.

## Cadence

Daily, in the data-refresh order: `ingest:events:ics`, `ingest:events:jsonld`, `ingest:events:mobilize`, `ingest:events:tribe`, `ingest:events:json`, `ingest:events:dxe`. Each run fetches every enabled source (skips are logged with a reason), POSTs in batches of at most 200, and reads the `207` rejections per the [runbook](/ingest/bot-runbook). A new source runs `--dry-run` once first. The cron line lives on the [automations page](/ingest/automations).
