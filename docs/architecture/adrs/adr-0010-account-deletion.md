---
title: "ADR-0010: Account deletion"
description: Deleting an account is a self-serve, immediate hard delete of everything tied to the member, shipped in v1.
---

# ADR-0010: Account deletion is a self-serve hard delete

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0003](/architecture/adrs/adr-0003-auth), [ADR-0005](/architecture/adrs/adr-0005-data-minimization) |

## Context

The App Store requires in-app account deletion for apps with account creation. More importantly, an activist who wants out should be able to leave no trace, immediately, without emailing anyone. Many apps implement deletion as a flag and a 30-day grace period during which everything remains.

## Decision

`DELETE /api/me`, reachable from settings on both clients behind a confirmation, runs this cascade in one transaction and then revokes every session:

| Collection | Action |
|---|---|
| `users` | Email, password hash, providers, avatar, area, interests cleared; `deletedAt` set; handle held for 30 days then released by a worker so it cannot be immediately reused to impersonate |
| `sessions`, `magic_links`, `push_tokens`, `notification_preferences`, `friend_invites` | Deleted |
| `friendships`, `grove_members`, `event_rsvps`, `saved_posts`, `reactions` | Deleted; derived counts recomputed |
| `posts`, `comments` | Deleted, including media keys queued for S3 and Bunny deletion |
| `messages` | Messages the member sent are deleted; conversations with no remaining participants are deleted |
| `action_log`, `companion_conversations` | Deleted |
| `place_reviews`, `places` (submitted) | Kept, detached: `userId` or `submittedBy` set to null, `showHandle` forced false |
| `reports` | Kept for moderation with `reportedBy` nulled |
| Backups | Nightly dumps age out in 30 days; a deleted member's data is gone from backups within that window |

Media deletion runs asynchronously through a worker with retries; the record deletion is synchronous.

## Alternatives considered

- **Soft delete with a grace period.** Friendlier to accidental deletions. Rejected; the confirmation step covers accidents, and a promise of immediate deletion is worth more to this audience.
- **Keep posts anonymized.** Some communities prefer that threads survive. Rejected; a photo from an action is personal even without a name.

## Consequences

### Positive

- The privacy page's promise is literally true.
- App Store compliance from the first submission.

### Negative

- Deleted content leaves gaps in other members' feeds and conversations. Accepted.
- Reviews survive detached, which keeps Places useful. Documented on the privacy page.
