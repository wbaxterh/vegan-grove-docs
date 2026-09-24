---
title: Places
description: The map of sanctuaries, vegan businesses, organizations, and venues across Southern California, and how a place gets on it.
sidebar_position: 1
---

# Places

Status: **Proposed 2026-09-24**, scaffolded in the API (list, get, submit, approve)

Places are The Trick Book's Spots with the sport swapped for the cause. A Place is a sanctuary, restaurant, cafe, grocery, shop, organization, or venue with a pin on the map, a vegan level, and community verification. Places are public and carry no member data, which makes them the safest feature to ship first.

## Why

An activist new to an area asks three questions: where can I eat, where can I volunteer, where do people meet. A map that answers all three with data the community keeps honest is the reason to open the app on a Tuesday, which is what makes the Saturday action discoverable.

## What ships in v1

- A map (MapLibre, OpenFreeMap tiles) with clustered pins, filtered by type and vegan level, driven by the viewport's bounding box.
- A Place page: name, type, vegan level (`full` or `options`), address, hours, website, tags, photos, reviews, upcoming events at this place.
- Submit a place (signed in): pin drop or address search, type, vegan level, a photo. Enters `pending`; an admin approves. The submitter is never shown.
- Reviews and check-ins: rating, text, month visited, and an opt-in to show the author's handle.
- Place lists: private collections ("want to try", "volunteer here"), shareable to friends later.
- Seed data: OpenStreetMap `diet:vegan` tags for the SoCal bounding box (531 tagged places at the time of writing) plus a curated sanctuary list, all imported as `pending` and approved by hand. See [data sources](/features/places/data-sources).

## Data and visibility

`places` (public once approved), `place_reviews` (public text, handle only if `showHandle`), `place_lists` (private unless `isPublic`). The [data model](/architecture/data-model) has the schema. Geo queries are bounding-box only; no point ever leaves the device ([ADR-0005](/architecture/adrs/adr-0005-data-minimization)).

## API

`GET /api/places?bbox=&type=&veganLevel=&q=`, `GET /api/places/:slug`, `POST /api/places` (member, pending), `GET`/`POST /api/places/:id/reviews`, `GET`/`POST`/`PATCH`/`DELETE /api/place-lists`, admin `GET /api/admin/places/pending`, `PUT /api/admin/places/:id/approve|reject`. Public reads return `approved` places only; a non-approved place is visible to its submitter and admins.

## Screens

Web: `/places` (map plus list), `/places/[slug]`. Mobile: the Places tab (map with a list toggle), a place sheet, submit-a-place, my lists.

## Verification

Community verification is what keeps the vegan level honest. See [verification](/features/places/verification).

## Open questions

- Hours: import from OSM when present, let members correct; do we show "hours unverified" until a member confirms?
- Claiming: a business can claim its Place to fix details. Claimed status is public; the claimant is not. Scope for M2 or later.
