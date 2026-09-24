---
title: Ivy (companion)
description: The companion that answers questions about places, events, and going vegan, drafts outreach, and forgets what it is not asked to keep.
sidebar_position: 9
---

# Ivy, the companion

Status: **Proposed 2026-09-24**, service and SSE route stubbed in the API. Working name; Wes may rename.

The Trick Book has Kaori: a chat companion with tools, a voice, and a 3D avatar. Vegan Grove gets a companion too, scoped for privacy first and for usefulness second. The decision record is [ADR-0012](/architecture/adrs/adr-0012-companion).

## What Ivy does

- Answers "where can I eat near Long Beach that is fully vegan" using the Places data.
- Suggests events this month from the member's interests and Groves (the Grove list is passed as names, not ids, and only when the member asks about events).
- Explains how to plan a first sanctuary visit or a first outreach shift, citing Guides.
- Drafts an outreach message, a letter to a council member, a caption.
- Answers vegan 101 and nutrition questions with the app's Guides as sources, and says when it is unsure.

## What Ivy knows

The member's handle, the interests they chose to share, and the current conversation. Tool results from public collections: Places, Events (public ones), Guides, Media. Nothing else: not the email, area, friends, RSVPs, messages, or action log. The system prompt tells the model these rules and instructs it never to ask for personal details.

## Memory

Conversations are stored so the member can continue them. Unpinned conversations are deleted after 24 hours by a TTL index. A pinned conversation stays until the member deletes it or deletes their account.

## What ships in v1

- Text chat on web (`/app/companion`) and mobile (a modal from Home), streamed token by token over SSE.
- Read-only tools: search places, list events, find guides, find media.
- Pin, unpin, delete conversations.
- A visible line on first use: "Ivy knows your handle and interests, nothing else. Unpinned chats vanish in 24 hours."

## Not in v1

Voice, a 3D stage, actions on the member's behalf (RSVP, post, message), and memory across conversations. Each is a candidate for a later ADR once the text companion has users.

## Implementation notes

- `@anthropic-ai/sdk`, streaming, adaptive thinking, `COMPANION_MODEL` from config (default `claude-opus-5`). The system prompt is cached across requests.
- `POST /api/companion/chat` returns `text/event-stream`. The API stores the assistant turn only when the stream completes.
- Rate limit per member per hour, with a friendly message when exceeded.
- Tool calls go through the same services the REST routes use, so visibility rules cannot be bypassed by the model.

## Open questions

- The name. Ivy fits (a plant, two syllables, reads as a person) and is a working name.
- Whether Ivy should ever see a Grove name to tailor event suggestions. Proposal: yes, names only, only when the member asks about events, disclosed in the first-use line.
