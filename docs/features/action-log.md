---
title: Action log
description: A private impact journal of events attended, outreach hours, and volunteer shifts, visible only to the member, with opt-in aggregates.
sidebar_position: 11
---

# Action log

Status: **Proposed 2026-09-24**

The Trick Book's trick lists are a progression engine. Activism has progression too: a first outreach shift, a first vigil, a hundredth hour at a sanctuary. The Action log is where that lives, and it is private by construction, because a public record of where an activist has been is exactly what this product refuses to hold in the open.

## What ships in v1

- Entries: event attended (auto-suggested from RSVPs after the event ends, confirmed by the member), outreach (hours, optional note), volunteer shift (hours, optional Place), other.
- A private timeline and simple totals: events, hours, shifts, by month and all time.
- Delete any entry. Export your own log as CSV.
- Opt-in aggregate: a member can contribute their totals (not entries) to their Grove's anonymous totals ("Long Beach Grove: 412 outreach hours this year"). Off by default.

## Why it exists

The Improve step of the loop needs a place to look back. Members who see their own numbers keep going. Organizers who see their Grove's anonymous totals can celebrate them without a leaderboard. There is no leaderboard, no streaks, no badges shown to others.

## Data and visibility

`action_log`, self only. The opt-in aggregate is computed by a worker from members who enabled it and stored as a number on the Grove, never as a list. See the [data inventory](/privacy/data-inventory).

## API

`GET /api/actions`, `POST /api/actions`, `DELETE /api/actions/:id`, `GET /api/actions/export` (CSV), `PUT /api/me/action-aggregate-opt-in`.

## Screens

Web: `/app/settings` links to "My actions". Mobile: reached from the Home tab (a small card with this month's total) and from the profile stack.

## Relationship to RSVPs

RSVP rows are deleted 30 days after an event. The action log is the member's own durable record, under the member's control, which is the right place for history to live. The app suggests "add to your log?" once after each attended event and never nags.

## Open questions

- Whether the aggregate should be per Grove or platform-wide. Proposal: both, opt-in covers both.
- Whether to let organizers log hours on behalf of attendees. Proposal: no; the member confirms.
