---
title: "ADR-0011: Message encryption"
description: Direct messages are encrypted at rest with a key outside the database and expire after 90 days; end-to-end encryption is the planned successor.
---

# ADR-0011: Messages encrypted at rest with retention, end-to-end later

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0008](/architecture/adrs/adr-0008-database) |

## Context

Wes wants direct messages in v1. Organizers coordinate actions over chat, and the threat model rates a database dump and a stolen session as real adversaries. The Trick Book stores message bodies in plaintext. True end-to-end encryption on React Native with multi-device support and group chats is a project on its own (key exchange, device enrollment, backup of keys, forward secrecy), and doing it badly is worse than being honest about not doing it yet.

## Decision

**v1: encrypted at rest.**

- Message bodies are encrypted in the API with AES-256-GCM before storage. The document holds `ciphertext`, `iv`, and `keyId`; the key comes from the `DM_ENCRYPTION_KEY` environment variable on the API host (moved to AWS KMS envelope encryption in M3, with `keyId` supporting rotation).
- Retention: every message carries `expiresAt`, default 90 days, deleted by a TTL index. Members can set a shorter window per conversation.
- The Socket.IO `/messages` namespace requires a session and checks conversation membership before joining a room.
- Messages are never logged, never sent to the companion, never indexed for search.

**v2: end-to-end encryption**, as a separate ADR once v1 is stable. The likely shape is per-device keys in SecureStore, a server-held directory of public keys, sealed-sender envelopes, and no key backup (losing devices loses history, which this audience is likely to accept).

The privacy page states plainly that in v1 the operator can technically read messages with the key, and that retention and public code are the interim controls.

## Alternatives considered

- **Plaintext, like The Trick Book.** Rejected.
- **End-to-end in v1.** The right end state, the wrong first step for a single developer shipping four repos. Rejected for v1.
- **Use a hosted E2E messaging service (Matrix, Stream).** Adds a third party holding the social graph. Rejected.

## Consequences

### Positive

- A database dump does not expose conversations.
- Retention limits the value of a stolen session.
- The honest statement builds more trust than an overclaimed "encrypted".

### Negative

- The operator holds the key. Mitigation: the key lives only on the API host and later in KMS, and this limitation is disclosed.
- Search across messages is not possible. Accepted.
