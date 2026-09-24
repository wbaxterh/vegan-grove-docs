---
title: "ADR-0003: Authentication"
description: Members sign in with a password, a magic link, Apple, or Google, and every method produces the same opaque, revocable, server-side session.
---

# ADR-0003: Four sign-in methods over opaque hashed sessions

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0004](/architecture/adrs/adr-0004-profiles-never-public), [ADR-0010](/architecture/adrs/adr-0010-account-deletion) |

## Context

Wes asked for SSO, a magic link, and regular email-plus-password sign-in, and asked whether Proton could be an SSO provider. Proton offers no public OpenID Connect identity provider for third-party apps (it remains a community feature request as of 2026), so a "Sign in with Proton" button cannot be built honestly. The Trick Book uses a seven-day JWT in a custom header and has an account-takeover bug in its Apple route because the body's email was preferred over the token's.

## Decision

- **Methods:** email and password (argon2id), magic link by email, Sign in with Apple, Google Identity. Proton users are served by the magic link, which works with any address and is the most private of the four.
- **Sessions:** opaque 32-byte tokens, stored as SHA-256 hashes, 30-day sliding expiry with a TTL index, sent as `Authorization: Bearer`. No JWTs. Sessions are listed and revocable per device in settings.
- **Identity from the token, never the body.** SSO routes take email and subject from the verified identity token only. Linking goes by provider subject first, then by verified email.
- **No account enumeration.** The magic-link route always answers 202. Login failures are uniform.
- **Roles from the database.** `admin` is checked on the user document per request. Organizer is a per-Grove or per-organization membership, never a global role.

## Alternatives considered

- **JWT with refresh tokens.** Standard, stateless, and revocation needs a denylist anyway, at which point the session table is simpler and strictly better for a product that promises instant deletion.
- **Magic link only.** The most private option and enough to avoid the App Store's Sign in with Apple requirement. Rejected because Wes wants SSO and passwords too; the cost is a larger auth surface, mitigated by the uniform session model.
- **Passkeys.** Better than passwords and private. Deferred to a later ADR once the four methods are stable; the session model does not change.
- **An auth provider (Cognito, Auth0, Clerk).** Removes code but adds a third party that sees every member's email and sign-in events, which the [threat model](/privacy/threat-model) counts as an adversary.

## Consequences

### Positive

- Revocation and deletion are immediate.
- One session model for all four methods and both clients.
- The takeover class of bug is structurally absent.

### Negative

- One indexed database read per authenticated request. Acceptable at any scale this product will see.
- Four methods means four test matrices. The scaffold ships password and magic link fully tested; Apple and Google ship with shape and verification but need real client ids to test end to end.
- SES must leave the sandbox before magic links reach arbitrary addresses.
