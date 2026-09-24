---
title: "ADR-0005: Data minimization"
description: The complete list of personal fields Vegan Grove stores, the rule that device location never reaches the server, and EXIF stripping on the device.
---

# ADR-0005: Collect the minimum, and never a location

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0004](/architecture/adrs/adr-0004-profiles-never-public), [ADR-0007](/architecture/adrs/adr-0007-no-third-party-analytics), [ADR-0013](/architecture/adrs/adr-0013-media-pipeline) |

## Context

Every field stored is a field that can leak. The Trick Book stores a free-text age, a name, a location string, and sends device coordinates as query parameters to its spot search. None of that is needed to run a community app.

## Decision

- A member is: `email` (delivery only), `handle`, optional `avatarKey`, `homeArea` from a fixed list of eleven regions, `interests` tags, sign-in `providers`, two booleans (`discoverable`, `publicPostsEnabled`), `role`, timestamps. Nothing else. The full list with visibility and retention is the [data inventory](/privacy/data-inventory), and a PR that adds a personal field must add a row there.
- **Device location never reaches the server.** The map is centered client-side. Place and event queries send a bounding box. No `$near` query exists. Map routes do not log query strings.
- **EXIF is stripped on the device** before any image upload (mobile re-encodes with `expo-image-manipulator`, web through a canvas). Video is uploaded to Bunny, which transcodes; originals are never served.
- **Coarse over precise everywhere:** `visitedMonth` not a date on reviews, `homeArea` not a city, event RSVPs stored without a timestamp finer than the day.
- Logs redact authorization headers, emails, tokens, and never include request bodies.

## Alternatives considered

- **Store a city or ZIP for better local suggestions.** Rejected; the eleven-region list gives enough for event suggestions and Grove matching without pinning anyone.
- **Store coordinates for "events near me".** Rejected; a bounding box from the client gives the same UX.
- **Strip EXIF server-side.** Simpler to guarantee but the original would transit and briefly rest on our infrastructure. Rejected; the device is the right place, and the API refuses images whose headers still carry GPS tags as a second check (planned, M2).

## Consequences

### Positive

- A database dump reveals emails and handles, and little else about anyone.
- The privacy page can be short and true.

### Negative

- Some features are coarser than competitors': no "near me", no city-level filtering finer than region. Accepted.
- Client-side EXIF stripping is a client responsibility; the server-side check in M2 closes the gap for third-party clients.
