---
title: "ADR-0004: Profiles never public"
description: There is no public profile page, no user lookup endpoint outside a friendship, and discovery is by invite code, not search.
---

# ADR-0004: Profiles are never public

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0005](/architecture/adrs/adr-0005-data-minimization) |

## Context

Vegan Grove's members are activists. A public profile page is a directory of activists, and a directory is the single artifact the [threat model](/privacy/threat-model) most wants to prevent. The Trick Book has public profiles, a riders directory, a `GET /users?email=` lookup, and a `GET /user/:id` that returns any user's full document to any signed-in caller. Wes also wants a feed that works like a normal social app, which normally implies public profiles.

## Decision

- No public profile route exists on the web or in the app. No `GET /users/:id`. No search by handle unless the target has set `discoverable` on, and even then the result is "exists, send invite", not a profile.
- Friends connect by invite code (a short code or QR shown in person), with a 7-day expiry and a use limit.
- A handle is rendered only in contexts where the viewer is allowed to see the underlying object: a friend's post, a Grove post to a fellow member, an attendee to that event's organizer, a review where the author opted to show it.
- Public posts (opt-in, see [Feed](/features/feed)) show a handle and avatar. Tapping the handle opens a public-posts view: that handle's public posts and nothing else. No bio, area, friends, counts, or join date. This view is a list of posts, not a profile, and the API route is `GET /api/handles/:handle/posts`, which returns 404 when the handle has no public posts, so the route cannot be used to test whether a handle exists.
- Admin tooling never lists members beyond the handle and never exports.

## Alternatives considered

- **Private-by-default profiles with a public toggle.** Common in social apps. Rejected because the toggle would be used, and one public activist profile with a location and a friends list is the failure mode.
- **Public profiles for organizers only.** Organizers are the most exposed people in the movement already. Rejected; organizers are represented by their Grove or organization page, which carries no personal detail.

## Consequences

### Positive

- The product cannot leak a member list through its own UI.
- The reconciliation with the feed (opt-in public posts, a posts view instead of a profile) keeps the normal social loop without the directory.

### Negative

- Finding friends is harder than in other apps. Mitigation: invite codes at events, and Groves as the place you meet people.
- A member who posts publicly under a handle they use elsewhere is linkable. The app warns once when public posting is enabled.
