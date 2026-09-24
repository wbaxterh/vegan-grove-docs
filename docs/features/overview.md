---
title: Features overview
description: The feature set of Vegan Grove v1, what each one is for, and its visibility rule at a glance.
sidebar_position: 1
---

# Features overview

Status: **Proposed 2026-09-24**

Every feature below maps to a Trick Book concept in the [concept map](/product/concept-map) and follows the loop Learn, Plan, Act, Share, Improve. The visibility column is the rule the API enforces; clients only render.

| Feature | Loop step | What it is | Visibility | Milestone |
|---|---|---|---|---|
| [Places](/features/places) | Plan | Sanctuaries, restaurants, cafes, groceries, shops, orgs, venues on a map | Public, non-personal | M1 |
| [Events](/features/events) | Plan, Act | Protests, vigils, outreach, potlucks, sanctuary days, screenings | Public listing, private RSVP | M2 |
| [Groves](/features/groves) | Plan, Share | Local chapters by region | Public page, private membership | M2 |
| [Friends](/features/friends) | Share | Mutual connections by invite code | Private | M3 |
| [Feed](/features/feed) | Share | Photos and video to friends, a Grove, or (opt-in) the public | Friends by default | M3 |
| [Messages](/features/messages) | Share | 1:1 and group chat | Participants only, encrypted at rest | M3 |
| [Media](/features/media) | Learn | Vegan documentaries, films, talks, where to watch | Public | M2 |
| [Guides](/features/guides) | Learn | Outreach, rights, vegan 101, sanctuary volunteering | Public | M1 |
| [Ivy](/features/companion) | Learn, Plan | The companion | Self, ephemeral | M4 |
| [Notifications](/features/notifications) | Act | Event reminders, friend requests, messages | Self | M2 |
| [Action log](/features/action-log) | Improve | A private impact journal | Self | M3 |

## Feature pages

A feature earns a sidebar category of its own when it has an index (the PRD) plus an architecture, data, or spec page. Places and Events have that today. The rest are single pages until they grow.

Each feature page has the same sections: Why, What ships in v1, Data and visibility, API, Screens, Open questions. The PR that ships a feature updates its page in the same change.

## What is deliberately not a feature

- Public profiles or a member directory ([ADR-0004](/architecture/adrs/adr-0004-profiles-never-public)).
- "People nearby" or any location-based social feature.
- Follower counts, leaderboards, or streaks.
- Payments, subscriptions, or sponsored placement.
- Business-to-member messaging.
