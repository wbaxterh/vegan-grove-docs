---
title: Privacy
description: The Vegan Grove privacy promise in plain language, and the four pages that back it up.
slug: /privacy
sidebar_position: 1
---

# Privacy

Status: **Proposed 2026-09-24**

Vegan Grove is built for activists. The single worst thing this product could do is become a list of them. Every design decision in this documentation is downstream of that sentence.

## The promise

1. **We collect the minimum.** To use the app you give us an email address for signing in and a handle. That is all. No real name, phone number, birthdate, or photo is required. Your home area is a region you pick from a list, not an address.
2. **Your profile is never public.** There is no page on the web or in the app that shows who you are to someone who is not your friend. Friends are people you connected with on purpose, by invite code, not by search.
3. **We do not track your location.** Your phone uses its location to center the map. That position never reaches our servers. When you look at the map, the app asks for places in a rectangle, not for places near you.
4. **Photos lose their metadata before they leave your phone.** Cameras embed GPS coordinates in photos. The app re-encodes every image on the device before upload, which removes that data.
5. **What you attend is private.** When you RSVP, the organizer of that event can see you are coming. Everyone else sees a count.
6. **Messages are encrypted at rest and expire.** Direct messages are encrypted in the database and deleted after 90 days by default. End-to-end encryption is planned; see [ADR-0011](/architecture/adrs/adr-0011-messages-encryption).
7. **No third-party analytics. None.** No PostHog, no Google Analytics, no advertising SDKs, no crash reporters that carry personal data. We count things in aggregate on our own servers.
8. **The companion forgets.** Ivy knows your handle and the interests you chose to share. Conversations you do not pin are deleted after 24 hours.
9. **You can delete everything.** Account deletion is a real, immediate, hard delete of everything tied to you. It is in settings, not behind a support email.
10. **The code is public.** Anyone can read how all of this is implemented.

## The pages behind it

- [Data inventory](/privacy/data-inventory): every field we store, why, who can see it, and how long it lives.
- [Threat model](/privacy/threat-model): who might want this data, how they would try to get it, and what stops them.
- [Disclosure policy](/privacy/disclosure-policy): what these public docs will never contain.

## Decisions recorded as ADRs

[ADR-0004](/architecture/adrs/adr-0004-profiles-never-public) profiles never public, [ADR-0005](/architecture/adrs/adr-0005-data-minimization) data minimization, [ADR-0006](/architecture/adrs/adr-0006-maps) maps without Google, [ADR-0007](/architecture/adrs/adr-0007-no-third-party-analytics) no third-party analytics, [ADR-0010](/architecture/adrs/adr-0010-account-deletion) account deletion, [ADR-0011](/architecture/adrs/adr-0011-messages-encryption) message encryption, [ADR-0012](/architecture/adrs/adr-0012-companion) the companion.
