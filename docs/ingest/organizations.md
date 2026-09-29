---
title: Ingest organizations
description: How organizations are ingested from curated chapter directories, which fields are allowed, the verified moderation rule, the socials rule, and the monthly cadence.
sidebar_position: 4
---

# Ingest organizations

Status: **Proposed 2026-09-29**

Organizations are hosts: an event needs one, a sanctuary is one, and a member finds a chapter through one. They are curated, not discovered. `ingest:organizations` reads `scripts/data/organizations.json` in the API repo and POSTs to `POST /api/ingest/organizations` under the [contract](/ingest).

## What is in the directory

| Group | Source of truth | `type` |
|---|---|---|
| Anonymous for the Voiceless chapters in Southern California | the chapter list on the movement's own site | `org` |
| Animal Save Movement chapters | the chapter directory on the movement's own site | `org` |
| LA-area organizations: outreach groups, advocacy nonprofits, org-run meetups | each org's own site | `org` |
| Sanctuaries | `scripts/data/sanctuaries.json`, the same entries that become places | `sanctuary` |
| Vegan businesses that host events | their own site, added when they first host | `business` |

Every entry is checked by a person against the org's own site before it is added. A directory is read for the list of chapters; details always come from the chapter's own page.

## Item shape

| Field | Required | Rule |
|---|---|---|
| `sourceId` | yes | stable kebab-case key: `afv-long-beach`, `harbor-animal-save` |
| `name` | yes | as the org writes it |
| `type` | yes | `org`, `sanctuary`, `business` |
| `description` | | one or two sentences in the app's own words, not copied from the org |
| `website` | | the org's own site, https |
| `socials` | | handles only, see below |
| `area` | | one of the home areas, `other` when the org is regional |
| `sourceUrl` | | the page the entry was checked against |

`source` is `curated`. A sanctuary in `sanctuaries.json` is also sent as an organization with the same `sourceId`, which is how a sanctuary can host a volunteer day.

```json
{
  "sourceId": "harbor-animal-save",
  "name": "Harbor Animal Save",
  "type": "org",
  "description": "Bears witness at harbor-area slaughterhouses and organizes monthly vigils.",
  "website": "https://example.org",
  "socials": { "instagram": "harboranimalsave" },
  "area": "south_bay",
  "sourceUrl": "https://example.org/chapters"
}
```

## Socials

`socials` holds the organization's official handles as plain handles (`instagram: "harboranimalsave"`), never URLs and never a person's account. When a chapter's only presence is an organizer's personal profile, leave `socials` empty and point `website` at the movement's site. The API stores `{ instagram, facebook, bluesky, mastodon, tiktok, youtube }` and the clients build the links. Facebook here is a handle for an outbound link, not a data source.

## Moderation

Every ingested organization lands `verified: false` unless `curated` is in `TRUSTED_SOURCES`. An admin verifies after checking the site. `verified` never goes back to false through ingest, and `adminUserIds` is never part of an item or a response.

A stub created by event host resolution (see [events](/ingest/events)) has the org's slug and the event source's provenance. When the directory later adds the same org, the upsert matches the slug, adopts the stub, and sets `source: curated`, so no duplicate is created.

## Cadence

Monthly, and whenever the JSON changes. Chapters open and close, so the monthly run is also when a person rechecks each directory and removes entries whose site is gone. Removal is a pull request; ingest never deletes. A removed entry keeps its row with an aging `lastSeenAt` until an admin retires it.
