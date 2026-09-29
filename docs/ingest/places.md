---
title: Ingest places
description: How places are ingested from OpenStreetMap, community gardens, and the curated sanctuary list, with the tag mapping, the chain and fast-food rules, and the quarterly cadence.
sidebar_position: 2
---

# Ingest places

Status: **Proposed 2026-09-29**

Three scripts feed `places`: `ingest:places:osm`, `ingest:places:gardens`, and `ingest:sanctuaries`. All three POST to `POST /api/ingest/places` under the [contract](/ingest). Places are the safest resource to automate because a place is a business or a field, never a person. The first import and its history are on the [data sources](/features/places/data-sources) page.

## Item shape

| Field | Required | From |
|---|---|---|
| `sourceId` | yes | `osmId` (`node/123`, `way/456`, `relation/789`) or the curated key |
| `name`, `type`, `veganLevel` | yes | see the mapping below |
| `location { lng, lat }` | yes | the node itself, `center` for ways and relations, or geocoded |
| `address`, `city`, `postcode` | | `addr:housenumber` plus `addr:street`, `addr:city`, `addr:postcode` |
| `website`, `phone`, `hours` | | `website` or `contact:website`, `phone` or `contact:phone`, `opening_hours` |
| `tags[]` | | see richer tags |
| `description` | | source text, else generated |
| `chain` | | `true` when `brand` or `brand:wikidata` is set |
| `sourceUrl` | | `https://www.openstreetmap.org/` followed by the `osmId` |

`area` is not sent. The API derives it from coordinates through a table of bounding boxes per home area, and `city` falls back to that box's name when `addr:city` is missing. A free-text city never decides the area.

## OpenStreetMap

Query the Overpass mirror for `nwr["diet:vegan"~"^(yes|only)$"]` inside the Southern California bounding box with `out center tags`, sending a descriptive `User-Agent`.

| OSM tags | `type` | `veganLevel` |
|---|---|---|
| `diet:vegan=only` | by amenity or shop | `full` |
| `diet:vegan=yes` | by amenity or shop | `options` |
| `amenity=restaurant` | `restaurant` | |
| `amenity=fast_food` with `diet:vegan=only` | `restaurant` | `full` |
| `amenity=fast_food` with `diet:vegan=yes` | skipped | |
| `amenity=cafe`, `amenity=ice_cream` | `cafe` | |
| `shop=supermarket`, `greengrocer`, `health_food`, `convenience` | `grocery` | |
| any other `shop=*` | `shop` | |
| anything else | skipped and counted | |

The fast-food rule in one line: a fast-food place with a vegan option is not worth a pin, a fully vegan one is.

Chains: `brand` or `brand:wikidata` present sets `chain: true`. The public API hides chains unless the caller asks for them (`includeChains=true`) and never deletes them, because a fully vegan chain is still useful.

Richer tags go into `tags[]` as `key:value` strings, so the client can filter without a schema change: `cuisine:thai` (one tag per value of a semicolon-separated `cuisine`), `wheelchair:yes`, `outdoor_seating:yes`, `takeaway:yes`, `delivery:yes`. Only the values `yes`, `no`, and `limited` are kept for the last four.

Description: when OSM has no `description`, generate one sentence from what it does have, level first, then type, city, cuisine: "Fully vegan cafe in Long Beach. Cuisine: thai, vegan." Never invent hours or claims.

## Community gardens

`ingest:places:gardens` queries `leisure=garden` with `garden:type=community`, plus `landuse=allotments` that carry a `name`. Every hit becomes `type: garden`, `veganLevel: full`, with `website` and `opening_hours` when present and a generated description ("Community garden in San Pedro."). Unnamed allotments are skipped: a pin without a name helps nobody. Gardens matter because growing food is the quietest form of outreach a Grove can host.

## Curated sanctuaries

`ingest:sanctuaries` reads `scripts/data/sanctuaries.json` in the API repo. Each entry is hand-verified from the sanctuary's own site: name, address, website, a description in the app's own words, tags such as `tours` and `volunteering`. It is sent with `source: curated`, a stable kebab-case `sourceId` (`farm-sanctuary-socal`), `type: sanctuary`, `veganLevel: full`.

Entries without coordinates are geocoded with Nominatim at no more than one request per second with a descriptive `User-Agent`, and the result is written back into the JSON so the lookup runs once. Adding a sanctuary is a pull request to that file with the source page linked in the PR.

## Cadence and attribution

| Script | Cadence | Notes |
|---|---|---|
| `ingest:places:osm` | quarterly | `--dry-run`, read the counts, then run |
| `ingest:places:gardens` | quarterly | same run day as OSM |
| `ingest:sanctuaries` | when the JSON changes | small, safe to run any time |

OpenStreetMap data is ODbL. A place with `source: osm` shows "Data from OpenStreetMap contributors" on its page, and the map tiles carry the OSM attribution in the style. Nominatim results are also ODbL and are used only to place a curated pin.
