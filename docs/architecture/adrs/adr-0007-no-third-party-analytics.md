---
title: "ADR-0007: No third-party analytics"
description: No analytics or tracking SDK on any client; product signals come from aggregate counters computed on the API.
---

# ADR-0007: No third-party analytics, aggregate counters only

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |

## Context

The Trick Book's web app runs PostHog and Google Analytics and also batches every client event to its own backend; its mobile app sends a screen-view stream keyed by an installation id. That is normal product practice and it is exactly the behavioral record the [threat model](/privacy/threat-model) says must not exist for activists. The product still needs to know whether features work.

## Decision

- No analytics, tracking, or session-replay SDK in the web or mobile app. No client-side event stream to our own API either.
- Product signals are **aggregate counters** computed on the API from data it already holds: places viewed per day (a counter, not per user), RSVPs per event, posts per Grove, magic links sent, sign-ins per method. Exposed at `GET /api/stats` (public, cached) and an admin-only dashboard route, never per member.
- Crash reporting, if added, must be configured with no user identifiers and no breadcrumbs that carry content. Decided per tool in a follow-up ADR; nothing ships in v1.
- Feedback comes from an in-app form that is stored anonymously (no user id) with an aggregate tally.

## Alternatives considered

- **Self-hosted PostHog or Plausible.** Removes the third party but keeps the per-user behavioral record. Rejected; the record is the problem, not the vendor.
- **First-party event stream with an installation id, like The Trick Book mobile.** Same problem with a different key. Rejected.
- **Nothing at all.** Tempting but leaves the feedback loop in `SOUL.md` with no data. Aggregate counters are the compromise.

## Consequences

### Positive

- The privacy page can say "none" and mean it.
- Nothing to configure, no consent banner, no cookie policy beyond the session cookie.

### Negative

- Funnel analysis and retention cohorts are not possible. Accepted: for a community app the signal that matters is "did an action happen", which counters capture.
- Debugging a client bug relies on the member's report and on server logs, not on replay.
