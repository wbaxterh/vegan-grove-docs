---
title: "ADR-0012: Companion"
description: Ivy runs on the Anthropic API with streaming, knows only the member's handle and interests, and forgets unpinned conversations after 24 hours.
---

# ADR-0012: Ivy runs on the Anthropic API with ephemeral conversations

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0005](/architecture/adrs/adr-0005-data-minimization), [ADR-0007](/architecture/adrs/adr-0007-no-third-party-analytics) |

## Context

Wes wants an AI companion, as The Trick Book has Kaori. Kaori is an OpenRouter-backed chat with tools, a voice sidecar, and a 3D avatar, and the mobile bot-chat sends conversation content to whichever provider OpenRouter routes to. A companion is the one feature that necessarily sends member text to a third party, so the design question is what text, to whom, and for how long.

## Decision

- **Provider:** the Anthropic API directly through `@anthropic-ai/sdk`, streaming, with `thinking: { type: 'adaptive' }`. No router or aggregator, so exactly one third party sees the text and its data policy is the one on record. The model id is configuration (`COMPANION_MODEL`, default `claude-opus-5`); changing it is a config change, not a code change.
- **What Ivy knows:** the member's handle and stated `interests`, the current conversation, and tool results from public data (places, events, guides, media). Never email, area, friends, RSVPs, messages, or the action log.
- **Ephemeral by default:** a conversation is stored only so the member can continue it; unpinned conversations expire after 24 hours by TTL. A member can pin a conversation to keep it, and delete any at will. Deletion of the account deletes all of them.
- **No voice or avatar in v1.** The text companion ships first through an SSE route. Kith-style voice and a 3D stage are candidates for a later ADR.
- **Tools:** read-only lookups over public collections. Ivy cannot RSVP, post, or message on a member's behalf in v1.
- The system prompt lives in `src/services/companion/prompt.ts` and states the privacy rules to the model as well.

## Alternatives considered

- **OpenRouter, like Kaori.** Flexible model choice, but conversation text fans out to many providers with different retention policies. Rejected.
- **Local or self-hosted model.** No third party at all, but the quality gap for an organizer's assistant is large and the hosting cost defeats the budget. Deferred; revisit when small models are good enough for the guide-and-plan use case.
- **No companion.** Simplest and most private. Rejected by Wes; the companion is part of the product identity carried from The Trick Book.

## Consequences

### Positive

- One provider, one policy, one line in the [data inventory](/privacy/data-inventory).
- The forgetting default means a subpoena or a breach of the companion store finds little.

### Negative

- Cost scales with usage. Mitigation: streaming, prompt caching for the system prompt, and the model id in config so a cheaper model can be chosen deliberately.
- Members who want a companion that remembers must pin conversations. That is the point.
