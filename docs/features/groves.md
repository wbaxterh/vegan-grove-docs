---
title: Groves
description: Local chapters by region, the home for events and Grove-scoped posts, with private membership and public counts.
sidebar_position: 3
---

# Groves

Status: **Proposed 2026-09-24**

A Grove is a local chapter: Long Beach, LA Westside, LA Eastside, South Bay, San Gabriel Valley, San Fernando Valley, Orange County, Inland Empire, San Diego, Ventura. It is the unit organizers work in and the scope for events and posts that should reach locals without reaching the internet. There is no Trick Book equivalent; Groves are the piece that makes this an activism platform rather than a map with friends.

## What ships in v1

- One Grove per region to start, created by admins. Additional Groves (a campus, a city) can be added by admins on request.
- A public Grove page: name, region, description, member count, upcoming events, and organizers' handles (organizers opt in to being listed; a Grove with no listed organizers shows "contact through events").
- Join and leave. Membership is private: the member count is public, the member list is visible to that Grove's organizers only, and other members see each other only through Grove-scoped posts and events.
- Organizer role per Grove, granted by an existing organizer or an admin. Organizers create and edit the Grove's events and see its events' attendees.
- Grove-scoped feed: posts with `visibility: 'grove'` appear to members of that Grove.

## Data and visibility

`groves` (public), `grove_members` (private; counts public). A member can belong to several Groves. `homeArea` on the user is a hint for suggesting a Grove, not a membership.

## API

`GET /api/groves`, `GET /api/groves/:slug`, `POST /api/groves/:id/join`, `DELETE /api/groves/:id/leave`, organizer-only `GET /api/groves/:id/members`, admin `POST /api/groves`, organizer `POST /api/groves/:id/organizers`.

## Screens

Web: `/groves`, `/groves/[slug]`. Mobile: Groves are reached from the Home tab (your Groves) and from Events (filter by Grove). Joining is a one-tap action from the Grove page.

## Why not "communities" or "groups"

The name is part of the product: a grove is a stand of trees that share roots. It also avoids the generic-social-app feeling that "groups" brings, along with the moderation expectations that come with user-created groups. Groves are curated on purpose.

## Open questions

- Member-created Groves. Proposal: not in v1; see how the ten regional Groves are used first.
- Cross-Grove events (a statewide march). Proposal: host under an organization, tag participating Groves.
