---
title: Events
description: Protests, vigils, outreach, potlucks, sanctuary days, and screenings, hosted by Groves and organizations, with private RSVPs.
sidebar_position: 1
---

# Events

Status: **Proposed 2026-09-24**

Events are the Act step of the loop and the reason organizers will adopt the app. An event is time-bound, hosted by a Grove or an organization, and has a public listing with a private attendee list.

## Why

Organizers today coordinate over group chats that leak and event pages on platforms that sell attendance data. They need a headcount they trust and a way to reach attendees, and attendees need to say "I'm going" without announcing it to the world.

## What ships in v1

- Event types: protest, vigil, outreach, potluck, sanctuary day, screening, meeting, other.
- Public listing: title, type, when, host (Grove or organization), venue name and address, a cover image, description, and the RSVP count. Filter by date range, region, type, and Grove.
- **Details after RSVP:** an organizer can mark the exact meeting point as visible only to members who have RSVP'd. The listing then shows the region and a time.
- RSVP as going or interested. The organizer of that event sees the handles of attendees; everyone else sees counts.
- Visibility per event: `public`, `grove` (members of the hosting Grove), `friends` (the creator's friends, for small actions).
- Hosting: creating an event requires being an organizer of the hosting Grove or an admin of the hosting organization. Members cannot host as themselves in v1, which keeps the listing curated.
- Calendar export (ICS) and a "remind me" reminder through [notifications](/features/notifications).

## Data and visibility

`events`, `event_rsvps`, `groves`, `grove_members`, `organizations`. See the [data model](/architecture/data-model) and [RSVP privacy](/features/events/rsvp-privacy) for the exact rules on who sees what.

## API

`GET /api/events?from=&to=&area=&groveId=&type=`, `GET /api/events/:slug`, `POST /api/events`, `PATCH /api/events/:id`, `POST`/`DELETE /api/events/:id/rsvp`, `GET /api/events/:id/attendees` (organizer only). Listing queries apply visibility server-side using the caller's Grove memberships and friendships.

## Screens

Web: `/events` (list with filters, optional map), `/events/[slug]`. Mobile: the Events tab (upcoming, mine, by Grove), event sheet with RSVP and "add to calendar", organizer view with attendees and a message-all action.

## Relationship to Places

An event may reference a Place (a screening at a vegan cafe, a volunteer day at a sanctuary). The Place page lists upcoming events at it.

## Open questions

- Recurring events (weekly outreach). Proposal: v2, with a series id, after seeing how organizers use single events.
- Whether `interested` should count toward the public number. Proposal: show "going" only.
- Safety notes on protests (know your rights link, buddy system). Proposal: a Guide link on the event page for types `protest` and `vigil`.
