---
title: "ADR-0006: Maps"
description: Web and mobile maps use MapLibre with OpenFreeMap vector tiles, which need no API key, set no cookies, and collect no personal data.
---

# ADR-0006: MapLibre with OpenFreeMap tiles, no Google Maps

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0005](/architecture/adrs/adr-0005-data-minimization) |

## Context

Places and events are map-first features. The Trick Book uses Google Maps on both platforms, which means a Google SDK on every device, an API key that has already leaked in a public repo, per-load billing above the free quota, and every map view of every member reported to Google. For an activism app the last point is disqualifying on its own.

## Decision

- **Web:** `maplibre-gl` rendering the OpenFreeMap `liberty` style from the public instance.
- **Mobile:** `@maplibre/maplibre-react-native` with the same style. This requires an EAS development client; Expo Go cannot load it.
- OpenFreeMap's public instance requires no key or registration, sets no cookies, and states it collects no personal data. Tile requests still reveal the viewer's IP and the area viewed to that server, which is the same exposure as any CDN and far less than a Google SDK.
- Geocoding for place submission uses Nominatim through a server-side proxy with a rate limit, or manual pin drop. No Google Places.

## Alternatives considered

- **Google Maps Platform.** Best data, worst privacy, and a key to protect. Rejected.
- **Apple Maps via `react-native-maps` on iOS only.** Free and private on iOS, but Android would still need Google, and the web has no Apple Maps SDK worth using. Rejected for consistency.
- **Self-hosted Protomaps PMTiles on S3 and CloudFront.** Zero third parties, one static file for Southern California, pennies a month. Deferred: it is the upgrade path if OpenFreeMap's public instance becomes unreliable or a concern, and the client code does not change (only the style URL).
- **Mapbox.** Requires a token, tracks usage, bills above a quota. Rejected.

## Consequences

### Positive

- No map key anywhere in any repo, so the leak class disappears.
- No per-load cost.
- One rendering engine across web and mobile.

### Negative

- OpenStreetMap data has gaps compared to Google, especially business hours. Mitigation: hours are a Place field members can correct; the OSM `diet:vegan` seed is a starting point, not the source of truth.
- Mobile needs a dev client build for local development, which is a one-time EAS build per developer.
- Dependence on a donation-funded public tile server. Mitigation: the Protomaps path above, tested once during M1 so it is known to work.
