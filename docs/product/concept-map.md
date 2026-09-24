---
title: Concept map
description: How every Trick Book concept carries over to Vegan Grove, and the privacy rule attached to each.
sidebar_position: 3
---

# Concept map: The Trick Book to Vegan Grove

Status: **Proposed 2026-09-24**

Vegan Grove was designed by taking The Trick Book's model apart and asking, for each concept, what the activist equivalent is and what its privacy rule must be. This table is the glossary for the whole docs site.

| Trick Book | Vegan Grove | What it is | Privacy rule |
|---|---|---|---|
| Rider | **Activist** (member) | Anyone who signs up | Never public. Handle only. No real name field. See [ADR-0004](/architecture/adrs/adr-0004-profiles-never-public). |
| Homies | **Friends** | Mutual connection | Private. Connect by invite code or QR at an event, not by search. Discoverability off by default. |
| Spots | **Places** | Sanctuary, restaurant, cafe, grocery, shop, organization, venue | Public and non-personal. Seeded from OpenStreetMap `diet:vegan` tags and curated sanctuaries. |
| Spot approval | Place approval | private, pending, approved, rejected | Same states. Submitter is never shown. |
| Spot reviews | **Check-ins and reviews** | Rating, text, month visited | Pseudonymous by handle, and only when the author opts in per review. |
| Spot lists | **Place lists** | Personal collections | Private by default. |
| Trickipedia | **Guides** | Outreach scripts, know your rights, vegan 101, sanctuary volunteering, nutrition | Public, editorial, admin-authored. |
| Trick lists | **Action log** | A private impact journal: events attended, outreach hours, volunteer shifts | Private only. Aggregates opt-in. |
| Events | **Events** | Protests, vigils, outreach, potlucks, sanctuary days, screenings, meetings | Public listing. RSVP private. Attendee identities visible to the organizer only. |
| (none) | **Groves** | Local chapters: Long Beach, LA Westside, OC, IE, SD, Ventura and more | Membership private, member counts public. |
| (none) | **Organizations** | Orgs and sanctuaries that host events | Public. Admins never exposed. |
| Feed | **Feed** | Photos and video, like a normal social app | Default `friends`. Public posting is a per-user opt-in switch, then per post. EXIF stripped on device. |
| The Couch | **Media** | Vegan documentaries, films, talks, with where-to-watch links | Public library. Trailers load on click through the no-cookie YouTube domain. |
| Direct messages | **Messages** | 1:1 and group chat | Encrypted at rest, 90-day retention by default. See [ADR-0011](/architecture/adrs/adr-0011-messages-encryption). |
| Kaori (AI companion) | **Ivy** (working name) | An organizer's assistant | Sees the handle and stated interests only. Unpinned chats expire in 24 hours. See [ADR-0012](/architecture/adrs/adr-0012-companion). |
| Notifications | Notifications | Event reminders, friend requests, messages | Same subsystem shape as The Trick Book, no analytics attached. |
| Stripe freemium | (none) | | "Support" links out to sanctuaries. No payments in v1. |
| Chrome extension | (none) | | Replaced by an OpenStreetMap importer script in the API repo. |
| Riders directory | (none) | | A public directory is a public profile, which this product must not have. |
| Claimed, Instructor Outcomes | (none) | | Trick Book specific. |

## Two ideas that changed shape

**Progression became a private journal.** The Trick Book's trick lists are a progression engine and are often public. Activism has progression too (first outreach, first vigil, first sanctuary shift), but a public record of where an activist has been is exactly the data this product refuses to hold in the open. So the Action log exists, is private, and only its aggregates ever leave the account, and only when the member opts in.

**The public feed got a switch.** Wes asked for a feed that works like a normal social app, with photos and video. The privacy principle says profiles are never public. The reconciliation: posts default to friends, a member can flip `publicPostsEnabled` on, and a public post shows a handle and an avatar and nothing else. Tapping the handle opens that handle's public posts, not a profile: no bio, no area, no friends, no counts, no join date. See [Feed](/features/feed).

## Names

The product loop is Learn, Plan, Act, Share, Improve. The companion's working name is Ivy. Local chapters are Groves. Wes rejected "Allies" for connections; they are Friends.
