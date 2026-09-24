---
title: Messages
description: One-to-one and group chat between friends and within events, encrypted at rest, expiring by default, with realtime delivery over Socket.IO.
sidebar_position: 6
---

# Messages

Status: **Proposed 2026-09-24**

Direct messages are how organizers actually run things. The Trick Book's DM system (conversations, messages, typing, read receipts over a `/messages` socket namespace) is the shape carried over. What changed is storage: bodies are encrypted at rest and expire ([ADR-0011](/architecture/adrs/adr-0011-messages-encryption)).

## Who can message whom

- Friends can message each other.
- Event organizers can open a group conversation with an event's attendees ("message all"). Attendees see the organizer's handle and the event name; attendees do not see each other's handles in that conversation unless they are already friends. Implementation: a broadcast conversation type where replies go to the organizer, not the group, in v1.
- Grove organizers can message Grove members the same way.
- No business, organization, or unsolicited messaging. A member who is not a friend cannot start a conversation.

## What ships in v1

- 1:1 conversations, group conversations among friends, organizer broadcast conversations.
- Text and shared content (a Place, an Event, a post) as message types.
- Typing indicators and read receipts over Socket.IO, with membership checked before a client joins a conversation room.
- Retention: 90 days by default, adjustable per conversation down to 24 hours. Messages are deleted by a TTL index.
- Report a message. Delete your own message.
- Push notification on new message, respecting quiet hours.

## Data and visibility

`conversations`, `messages` (ciphertext, iv, keyId, expiresAt). Only participants can read. The operator holds the at-rest key in v1, disclosed on the [privacy page](/privacy).

## API and socket

`GET /api/conversations`, `POST /api/conversations`, `GET /api/conversations/:id/messages?cursor=`, `POST /api/conversations/:id/messages`, `POST /api/conversations/:id/read`. Namespace `/messages`: `join:conversation`, `leave:conversation`, `typing:start`, `typing:stop`; server `message:new`, `messages:read`. The session token rides in `handshake.auth.token`.

## Screens

Web: `/app/messages`, `/app/messages/[id]`. Mobile: the Messages tab, conversation screen, new conversation from the friends list, organizer "message attendees" from the event's organizer view.

## Open questions

- End-to-end encryption design (v2 ADR).
- Whether attendees in an organizer broadcast should be able to reply to the whole group. Proposal: organizer-only replies in v1, because a group of strangers seeing each other's handles is a leak.
- Media in messages. Proposal: images only, same EXIF rule, in M3.
