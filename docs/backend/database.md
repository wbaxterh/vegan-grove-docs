---
title: Database
description: Mongoose 9 on Atlas M0, the collection set grouped by domain with privacy-relevant fields, and every TTL and geo index.
sidebar_position: 3
---

# Database

Status: **Scaffolded 2026-09-24**

One MongoDB Atlas M0 cluster in `us-east-1`, accessed only by the API through Mongoose 9. The [data model](/architecture/data-model) page describes the shape and why; this page is the operational view: what collections exist, what indexes are declared, and which fields the [data inventory](/privacy/data-inventory) cares about.

## Conventions

- **Every reference is an `ObjectId`.** No string ids, no DBRefs, no mixed types. This was The Trick Book's worst debt and the Mongoose schema makes it structurally impossible here.
- **Every index is declared in the schema**, and `db/` calls `syncIndexes()` on boot so the database matches the code. An index that exists only in Atlas does not exist.
- `timestamps: true` on every schema.
- Field names are what the API returns; there is no mapping layer to hide a leaked field behind.

## Collections

| Domain | Collections | Privacy-relevant fields |
|---|---|---|
| Identity | `users`, `sessions`, `magic_links`, `friend_invites` | `users.email` (login only, never returned to another member), `users.homeArea` (fixed list, never shown outside the owner), `providers[].subject`, `sessions.tokenHash` (sha256, the raw token is never stored) |
| Social graph | `friendships`, `conversations`, `messages`, `reports` | `friendships` are visible only to the two parties; `messages.ciphertext`, `iv`, `keyId` (AES-256-GCM at rest); `reports.reportedBy` never exposed to the reported |
| Places | `places`, `place_reviews`, `place_lists`, `organizations` | `places.submittedBy` (nullable, detached on account deletion), `place_reviews.userId` with `showHandle=false` default, `place_lists.isPublic=false` default, `organizations.adminUserIds` never in a response |
| Community | `groves`, `grove_members`, `events`, `event_rsvps` | `event_rsvps` readable by the organizer only, counts for everyone; `events.detailsAfterRsvp` withholds address until RSVP |
| Content | `posts`, `comments`, `reactions`, `saved_posts`, `media_items`, `guides` | `posts.visibility` defaults to `friends`; `saved_posts` are private |
| Personal | `action_log`, `companion_conversations` | both private to the owner, both hard-deleted with the account |
| Notifications | `push_tokens`, `notification_preferences`, `scheduled_notifications` | `push_tokens.token` is a device address and is deleted on logout and on account deletion |

## Unique indexes

`users.email`, `users.handle`, `sessions.tokenHash`, `magic_links.tokenHash`, `friend_invites.code`, `places.slug`, `organizations.slug`, `groves.slug`, `events.slug`, `media_items.slug`, `guides.slug`, `push_tokens.token`, `notification_preferences.userId`, `scheduled_notifications.idempotencyKey`. Compound unique: `friendships (userA, userB)` with the pair sorted before write, `grove_members (groveId, userId)`, `event_rsvps (eventId, userId)`, `reactions (postId, userId)`, `saved_posts (postId, userId)`, `conversations.participantIds` sorted.

## TTL indexes

| Collection | Field | Expiry |
|---|---|---|
| `sessions` | `expiresAt` | `SESSION_TTL_DAYS`, default 30, refreshed on use |
| `magic_links` | `expiresAt` | 15 minutes |
| `friend_invites` | `expiresAt` | set per invite |
| `messages` | `expiresAt` | `DM_RETENTION_DAYS`, default 90 |
| `companion_conversations` | `expiresAt` | 24 hours when not pinned; the field is unset on pin so the TTL skips it |
| `push_tokens` | `deadAt` | 30 days after a delivery failure marks it dead |

TTL deletion is MongoDB's background job and runs about once a minute, so "expired" and "deleted" differ by up to a minute. Queries filter on `expiresAt` as well, so the gap is not observable through the API.

## Geo indexes

`places.location` and `events.location` are GeoJSON Points with a `2dsphere` index. `GET /api/places?bbox=` and the events list query with `$geoWithin` a `$box`; the bounding box comes from the client's viewport and is never stored or logged ([privacy rule 3](/privacy)).

## Atlas M0 limits that shape the code

512 MB of storage, shared CPU, no automated backups, and a connection cap. The API opens one Mongoose connection pool per process, keeps documents small (keys in S3, video ids at Bunny, no embedded arrays that grow without bound except `companion_conversations.messages`, which is capped by `COMPANION_HISTORY_LIMIT`), and treats a backup as a roadmap item rather than an assumption. Upgrading the tier changes nothing in the repo.
