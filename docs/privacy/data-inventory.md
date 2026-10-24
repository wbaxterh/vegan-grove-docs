---
title: Data inventory
description: Every personal field Vegan Grove stores, its purpose, who can see it, and how long it lives.
sidebar_position: 2
---

# Data inventory

Status: **Proposed 2026-09-24**, check-ins and catalogue fields added 2026-10-24

This is the contract behind the [privacy promise](/privacy). Any pull request that adds a personal field must add a row here first. Rows are grouped by the collection that holds them; the full schema is in the [data model](/architecture/data-model).

Visibility values: **self** (the member only), **friends**, **organizer** (of the event in question), **grove** (members of that Grove), **public**, **admin** (moderation only, never exported), **nobody** (stored, never read back except by the system).

## Account

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `email` | Sign-in and magic links | nobody (used to send mail) | Until deletion |
| `passwordHash` (argon2id) | Password sign-in, optional | nobody | Until deletion or password removal |
| `handle` | The only name other members see | friends, grove, organizer, public (only on public posts) | Until deletion |
| `avatarKey` | Optional picture | same as handle | Until deletion or removal |
| `homeArea` | One of eleven SoCal regions, picked from a list | self, and as an aggregate count per Grove | Until deletion |
| `interests` | Chosen tags, used by Ivy and for event suggestions | self, Ivy | Until deletion |
| `providers[]` | Apple or Google subject ids for SSO | nobody | Until deletion |
| `discoverable` | Whether friends can find you by handle (default off) | self | Until deletion |
| `publicPostsEnabled` | Whether you can post publicly (default off) | self | Until deletion |
| `role` | member or admin | nobody | Until deletion |

Not stored, ever: real name, phone number, birthdate, street address, device GPS, contacts, device identifiers beyond a push token.

## Sessions and sign-in

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `sessions.tokenHash` | SHA-256 of the session token | nobody | 30 days sliding, or on logout |
| `sessions.client` | ios, android, or web, so you can revoke a device | self | With the session |
| `magic_links.tokenHash` | Single-use sign-in link | nobody | 15 minutes |

## Social graph

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `friendships` | Who is friends with whom | the two members involved | Until either deletes the friendship or an account |
| `friend_invites.code` | Invite codes shared in person | self | Expires, default 7 days |
| `grove_members` | Membership and organizer role | self, organizers of that Grove; counts are public | Until leaving or deletion |

## Activity

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `event_rsvps` | Going or interested | self, organizer of that event; counts are public | 30 days after the event ends |
| `posts`, `comments`, `reactions`, `saved_posts` | The feed | per post: friends, grove, or public; comments follow the post | Until deletion |
| `place_reviews` | Pseudonymous review text. The handle is included only when that review set `showHandle` and the account still exists | public text; handle only if `showHandle` | Until deletion, then the row stays with `userId` cleared and `showHandle` forced false |
| `place_lists` | Saved places. `isPublic` is stored for future friend sharing and is not published yet | self | Until deletion |
| `place_checkins` | One visit confirmation per member per place per UTC month. Public responses return aggregates only | see the check-in fields below | The row stays after account deletion, with `userId` cleared, so the count stays |
| `saved_media` | The watchlist: a saved list of titles, never a history | self | Until deletion |
| `media_reactions` | "This moved me" and "I took action" on a title; the counts on the title are public, the rows are not | self | Until deletion |
| `action_log` | Private impact journal | self | Until deletion |
| `messages` (ciphertext) | Direct messages | participants | 90 days by default |
| `companion_conversations` | Ivy chats | self | 24 hours unless pinned |
| `push_tokens` | Device push address | nobody | 30 days after last use |
| `notification_preferences` | What to send | self | Until deletion |

### Check-ins

A check-in is separate from a review so a visit confirmation cannot carry a handle. The server assigns the UTC month (`YYYY-MM`). The client does not send it. One member can confirm a place once in that month. The place page and `GET /api/places/:id/check-ins` return `checkInCount`, `latestCheckInMonth`, and `verification` (`verified` or `unverified`). They do not return who went, a rating, or a list of visits. There is no leaderboard and no first-visitor flag.

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `place_checkins.userId` | The monthly limit, and finding the row on account deletion | nobody | Cleared on account deletion. The row stays |
| `place_checkins.month` | The UTC month bucket | nobody | With the row |
| `place_checkins.veganLevel` | The level the member confirmed | nobody | With the row |
| `place_checkins.rating` | Optional. Stored with the row and returned by no route | nobody | With the row |
| `places.checkInCount` | How many check-ins the place has | public | With the place |
| `places.latestCheckInMonth` | The newest check-in month | public | With the place |
| `places.lastAgreeingCheckInAt` | Drives `verification`. Not serialized | nobody | With the place |

`verification` is `verified` when `lastAgreeingCheckInAt` falls inside the last 180 days, and `unverified` otherwise. A Disputed state is described on the [verification page](/features/places/verification) and is not implemented.

## Server-side records that mention a member

| Record | What it holds | Retention |
|---|---|---|
| Access logs (pino) | Route, status, duration, a hash of the session id. Never email, token, coordinates, or bodies. | 14 days |
| `reports` | Who reported what and why, for moderation | Until resolved plus 90 days |
| Aggregate stats | Counts only, no ids | Indefinite |

## Ingested public data

`places`, `events`, `organizations`, `media_items`, `guides`, and (proposed) `creators` rows written by the [ingest endpoint](/ingest) carry no member data. Their provenance fields describe a source, not a person:

| Field | What it holds | Retention |
|---|---|---|
| `source`, `sourceId`, `sourceUrl` | Which public dataset or organization site the row came from, and its id there | With the row |
| `lastSeenAt` | The last ingest run that carried the row | With the row |
| `adminEdited` | Field paths an admin changed, so a re-ingest does not overwrite them | With the row |

Organizer names, attendee lists, and personal social accounts are dropped at the source and never stored. The one exception is [Creators](/features/creators): public figures who publish vegan content in public, listed by name with their own public site and channel handles so a member can follow a link out. No follower or view counts, no photos, and nothing read from a social platform are stored, and any creator can have their entry retired on request. The automation that runs ingest holds one credential, the ingest key, which can write only through `/api/ingest/*` and cannot read any collection. OpenStreetMap, Nominatim, Wikidata, TMDB, and Open Library receive only the script's own requests, never anything about a member. Facebook and Instagram are never called.

### Catalogue fields

These fields describe a public work or a public place. They are not member data, and account deletion does not touch them.

| Field | What it holds | Retention |
|---|---|---|
| `media_items.kind` | `documentary`, `film`, `series`, `talk`, `short`, or `book` | With the row |
| `media_items.authors` | Author names copied from the Open Library catalogue. Not members, and not linked to accounts | With the row |
| `media_items.externalIds.isbn` | One ISBN on a book, ISBN-13 when the catalogue has a valid one | With the row |
| `media_items.externalIds.openLibrary` | The Open Library work id | With the row |
| `media_items.year` | Catalogue year. The floor is 1000 so a pre-1900 book can keep its year | With the row |
| `places.tags` value `market:farmers` | A `grocery` that is a farmers or produce market. Same place type as a store; the tag marks the weekly market | With the row |

## What third parties receive

| Party | What | Why |
|---|---|---|
| AWS SES | Your email address and the sign-in link | To deliver magic links and account mail |
| Apple, Google | Nothing from us. When you use SSO they tell us a subject id and, if you allow, an email. | SSO |
| Bunny Stream | Video files you upload, already stripped of metadata | Transcoding and playback |
| OpenFreeMap | Map tile requests from your device (no key, no cookies) | Map rendering |
| Anthropic | Your handle, your chosen interests, and the text of your Ivy conversation | Running the companion |
| OpenRouter, and Microsoft Azure as the upstream provider it routes to | When knowledge search ships: the text of a search Ivy runs for you (not your handle, interests, or conversation), and the public text of Guides, media, creators, places, and public events. Routed only to a zero-retention endpoint, fallbacks off ([ADR-0014](/architecture/adrs/adr-0014-knowledge-base)). | Turning text into embeddings for search by meaning |

No party receives your email for advertising, your location, your friends, or your RSVPs.
