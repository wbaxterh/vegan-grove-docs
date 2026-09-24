---
title: RSVP privacy
description: Exactly who can see that a member is attending an event, for how long, and how the API enforces it.
sidebar_position: 2
---

# RSVP privacy

Status: **Proposed 2026-09-24**

An RSVP is the most sensitive record in the product after messages: it says a named person intends to be at a named place at a named time, often at a protest. This page is the rule set. The [threat model](/privacy/threat-model) explains the adversaries.

## Who sees what

| Viewer | Sees |
|---|---|
| Anyone (public event) | The count of `going` |
| Members of the hosting Grove (grove event) | The count of `going` |
| The organizer(s) of that event | Handles and avatars of `going` and `interested`, and the message-all action |
| A friend of the attendee | Nothing, unless the attendee chooses to share the event with them (which shares the event, not the RSVP) |
| The attendee | Their own RSVP in "my events" |
| Admins | Counts, and handles only in a moderation case tied to a report |

There is no "who else is going" list for attendees. This is the deliberate difference from every mainstream events product, and the trade is worth it: a member can RSVP to an action without any other member learning it.

## Enforcement

- `GET /api/events/:id/attendees` loads the event, checks that the caller is an organizer of the hosting Grove or an admin of the hosting organization, and otherwise returns 404 (not 403, so the route does not confirm the event's existence to a caller who cannot see it).
- `GET /api/events/:id` never embeds attendees.
- Counts are stored as `rsvpCount` and recomputed by the RSVP service on every change; they are never computed on the client from a list.
- `event_rsvps` rows are deleted 30 days after the event ends by a worker, so the historical record of attendance does not accumulate. A member's private [action log](/features/action-log) is where their own history lives, under their control.

## Details after RSVP

For sensitive actions, organizers can hide the exact meeting point until a member RSVPs. The listing shows the region and the time; the event page shows the address only in the response to an RSVP'd caller. This is a visibility check in the event read path, not a separate endpoint, so the address never appears in a public listing payload.

## Organizer trust

Organizers of an event necessarily see who is coming. The controls: organizer status is per Grove or per organization (never global), the attendee list is a screen and not an export, and the docs say plainly that organizers see attendees so members can decide accordingly.

## Notifications

Reminders ("your event is tomorrow") are sent to the attendee only. The organizer receives count milestones, never names, in push notifications.
