---
title: Data model
description: The Mongoose collections behind Vegan Grove, how they relate, and which fields carry privacy rules.
sidebar_position: 4
---

# Data model

Status: **Scaffolded 2026-09-24**

Every collection is a Mongoose schema in `vegan-grove-api/src/models`, with `timestamps: true`, every reference an `ObjectId`, and every index declared in the schema. That last sentence is the whole lesson from The Trick Book, where 38 collections were shaped by whichever `insertOne` ran first and `userId` was an ObjectId, a string, or a DBRef depending on the file.

The field-level privacy view is the [data inventory](/privacy/data-inventory). This page is the structural view.

## Relationships

```mermaid
flowchart TB
  User["users"]
  User -->|1 to many| Sessions["sessions"]
  User -->|sorted pair| Friendships["friendships"]
  User -->|joins| GroveMembers["grove_members"]
  Groves["groves"] --> GroveMembers
  Groves -->|hosts| Events["events"]
  Orgs["organizations"] -->|hosts| Events
  Places["places"] -.->|may locate| Events
  Events --> Rsvps["event_rsvps"]
  User -->|makes| Rsvps
  User -->|writes| Posts["posts"]
  Posts --> Comments["comments"]
  Posts --> Reactions["reactions"]
  Places --> Reviews["place_reviews"]
  User -->|keeps| Lists["place_lists"]
  Conversations["conversations"] --> Messages["messages"]
  User -->|records| Actions["action_log"]
  User -->|has| Companion["companion_conversations"]
```

## Collections by domain

### Identity

| Collection | Key fields | Indexes |
|---|---|---|
| `users` | `email` (lowercase), `emailVerifiedAt`, `passwordHash?`, `handle`, `avatarKey?`, `homeArea`, `discoverable`, `publicPostsEnabled`, `role`, `providers[]`, `interests[]`, `deletedAt?` | unique `email`, unique `handle`, `providers.provider + providers.subject` |
| `sessions` | `userId`, `tokenHash`, `expiresAt`, `lastSeenAt`, `client` | unique `tokenHash`, TTL `expiresAt`, `userId` |
| `magic_links` | `email`, `tokenHash`, `expiresAt`, `usedAt?` | unique `tokenHash`, TTL `expiresAt` |

### Social graph

| Collection | Key fields | Indexes |
|---|---|---|
| `friendships` | `userA`, `userB` (sorted so the pair is canonical), `status`, `requestedBy` | unique `userA + userB`, `userB` |
| `friend_invites` | `userId`, `code`, `expiresAt`, `usesLeft` | unique `code`, TTL `expiresAt` |
| `groves` | `name`, `slug`, `area`, `description`, `memberCount` | unique `slug`, `area` |
| `grove_members` | `groveId`, `userId`, `role` | unique `groveId + userId`, `userId` |
| `organizations` | `name`, `slug`, `type`, `description`, `website?`, `verified`, `adminUserIds[]` | unique `slug` |

### Places and events

| Collection | Key fields | Indexes |
|---|---|---|
| `places` | `name`, `slug`, `type`, `veganLevel`, `location` (GeoJSON Point), `address`, `city`, `area`, `tags[]`, `photoKeys[]`, `approvalStatus`, `submittedBy?`, `source`, `osmId?`, `ratingAvg`, `reviewCount` | unique `slug`, 2dsphere `location`, `approvalStatus + type`, sparse unique `osmId` |
| `place_reviews` | `placeId`, `userId`, `rating`, `content`, `visitedMonth`, `showHandle`, `status` | `placeId + createdAt`, `userId` |
| `place_lists` | `userId`, `name`, `placeIds[]`, `isPublic` | `userId` |
| `events` | `title`, `slug`, `type`, `startsAt`, `endsAt`, `location`, `placeId?`, `venueName`, `address`, `detailsAfterRsvp`, `hostType`, `hostId`, `description`, `coverKey?`, `visibility`, `rsvpCount`, `status`, `createdBy` | unique `slug`, 2dsphere `location`, `startsAt + status`, `hostType + hostId` |
| `event_rsvps` | `eventId`, `userId`, `status` | unique `eventId + userId`, `userId` |

### Feed

| Collection | Key fields | Indexes |
|---|---|---|
| `posts` | `userId`, `mediaType`, `imageKeys[]`, `bunnyVideoId?`, `caption`, `visibility`, `groveId?`, `placeId?`, `eventId?`, `stats`, `status` | `userId + createdAt`, `visibility + createdAt`, `groveId + createdAt` |
| `comments` | `postId`, `userId`, `parentId?`, `content`, `status` | `postId + createdAt` |
| `reactions` | `postId`, `userId`, `type` | unique `postId + userId` |
| `saved_posts` | `postId`, `userId` | unique `postId + userId` |
| `reports` | `targetType`, `targetId`, `reportedBy`, `reason`, `status` | `status + createdAt` |

### Messages

| Collection | Key fields | Indexes |
|---|---|---|
| `conversations` | `participantIds[]` (sorted), `lastMessageAt`, `unread` | unique `participantIds`, `participantIds + lastMessageAt` |
| `messages` | `conversationId`, `senderId`, `ciphertext`, `iv`, `keyId`, `type`, `expiresAt` | `conversationId + createdAt`, TTL `expiresAt` |

### Content and companion

| Collection | Key fields | Indexes |
|---|---|---|
| `media_items` | `title`, `slug`, `kind`, `year`, `synopsis`, `posterKey?`, `watchLinks[]`, `trailerYoutubeId?`, `tags[]`, `featured`, `status` | unique `slug`, `status + featured` |
| `guides` | `title`, `slug`, `category`, `body`, `status` | unique `slug`, `category` |
| `action_log` | `userId`, `type`, `eventId?`, `hours?`, `note?`, `occurredAt` | `userId + occurredAt` |
| `companion_conversations` | `userId`, `messages[]`, `pinned`, `expiresAt?` | `userId`, TTL `expiresAt` |

### Notifications

| Collection | Key fields | Indexes |
|---|---|---|
| `push_tokens` | `userId`, `token`, `platform`, `deadAt?` | unique `token`, TTL `deadAt` |
| `notification_preferences` | `userId`, `eventReminders`, `friendRequests`, `messages`, `quietHours?` | unique `userId` |
| `scheduled_notifications` | `userId`, `kind`, `payload`, `scheduledFor`, `status`, `idempotencyKey` | unique `idempotencyKey`, `scheduledFor + status` |

## Conventions

- Derived counters (`memberCount`, `rsvpCount`, `ratingAvg`, `reviewCount`, `stats`) are maintained by the service that owns the write and recomputed by a nightly worker. They are never trusted for permission checks.
- TTL indexes carry the retention policy: sessions, magic links, invites, messages, unpinned companion conversations, dead push tokens.
- Soft delete exists only on `users` (`deletedAt`) so that a deleted account's handle is released after a cooling period. Every other deletion is hard.
- Geo queries are bounding-box `$geoWithin` on the 2dsphere index. There is no `$near` query anywhere, because `$near` needs a point, and the client never sends one.
