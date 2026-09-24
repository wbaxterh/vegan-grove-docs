---
title: Friends
description: Mutual connections made by invite code, not by search, and the private graph that unlocks the friends-only feed and messages.
sidebar_position: 4
---

# Friends

Status: **Proposed 2026-09-24**

Friends are The Trick Book's Homies with the discovery model replaced. A friendship is mutual, private, and made on purpose. It is the key that unlocks friends-only posts and direct messages.

## How you find friends

There is no search by name. There are two paths:

1. **Invite code.** A member generates a short code (or shows it as a QR) and hands it to someone at an event, a potluck, a sanctuary shift. The other member enters it; both are now friends. Codes expire in 7 days and can be single-use or multi-use (for a table at a potluck).
2. **Discoverable handle.** A member who switches `discoverable` on can be found by exact handle. The result is "found, send request", not a profile. The request is accepted or ignored; ignoring is silent.

This is slower than "people you may know". That is the point. The [threat model](/privacy/threat-model) treats a friends-of-friends graph as something the product must not build.

## What friends can see

- Each other's handle and avatar.
- Posts with `visibility: 'friends'`.
- Each other in direct messages.
- Nothing else: no area, no Groves, no RSVPs, no friends list. Friend lists are never shown to anyone but the owner.

## What ships in v1

- Invite codes with QR, expiry, and use count.
- Discoverable handle lookup, off by default.
- Friend requests (from a lookup), accept, ignore, remove.
- The friends list for the owner, with remove.

## Data and visibility

`friendships` (sorted pair, unique), `friend_invites`. Both private to the members involved. See the [data model](/architecture/data-model).

## API

`GET /api/friends`, `GET /api/friends/requests`, `POST /api/friends/invites`, `POST /api/friends/invites/:code/accept`, `POST /api/friends/requests` (by discoverable handle), `POST /api/friends/requests/:id/accept`, `DELETE /api/friends/:userId`.

## Screens

Web: `/app/friends`. Mobile: reached from the Home tab and from Messages. The invite code screen is one tap from Home because it is used in the field.

## Open questions

- Whether removing a friend should also delete the shared conversation. Proposal: no; the conversation stays readable until retention removes it, but neither party can send.
- Blocking. Proposal: v1 ships remove plus report; a block that also hides Grove posts is M3.
