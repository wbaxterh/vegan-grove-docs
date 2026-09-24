---
title: Navigation
description: The expo-router route groups, the five tabs, the hidden profile stack, the companion modal, AuthGate, and deep links.
sidebar_position: 2
---

# Navigation

Status: **Scaffolded 2026-09-24**

Routing is file-based through expo-router. Two route groups split the app into signed-out and signed-in worlds, and one component decides which world you are in.

## Route groups

```
app/
  _layout.tsx
  (auth)/
    _layout.tsx        stack, no header
    welcome.tsx
    login.tsx
    register.tsx
    magic-link.tsx     enter email, then "check your inbox"
  (tabs)/
    _layout.tsx        tab bar
    index.tsx          Home
    places.tsx
    events.tsx
    feed.tsx
    messages.tsx
  profile/
    _layout.tsx        stack, pushed over the tabs
    index.tsx  edit.tsx  settings.tsx  privacy.tsx  account.tsx
  companion.tsx        presentation: modal
```

Group names in parentheses do not appear in the URL, so `/login` and `/places` are the paths regardless of the folder they sit in.

## The five tabs

Home (this week's events and your groves), Places (the map), Events, Feed, Messages. The order follows the loop in [SOUL](/product/vision): plan with places and events, act, share in the feed, coordinate in messages. There is no Profile tab and no Search tab. Profile is reached from the avatar in the header; search is inside Places and Events where it has a scope.

## Profile stack

`profile/` is a stack outside `(tabs)` so it pushes over the tab bar rather than replacing a tab. It is hidden from the tab bar with `href: null` in the tabs layout. Its screens are the member's own view only (there is no route that shows another member's profile, see [ADR 0004](/architecture/adrs/adr-0004-profiles-never-public)): `index` (handle, avatar, home area), `edit`, `settings` (theme, notification preferences), `privacy` (the `publicPostsEnabled` and `discoverable` switches, with plain explanations), and `account` (sessions, delete account).

## Companion modal

`companion.tsx` is declared in the root layout with `presentation: 'modal'` so it slides up over any tab and dismisses back to where you were. It has no tab and no persistent state of its own; the conversation list comes from the API and unpinned conversations expire ([companion](/features/companion)).

## AuthGate

`AuthGate` wraps the root layout's navigator. On mount it asks `authStore` to restore: read the token from SecureStore, call `GET /api/me`, and settle into `signedIn` or `signedOut`. While restoring it renders the splash; nothing navigates. Then, on every segment change:

- `signedOut` and the current segment is not `(auth)`: replace with `/welcome`.
- `signedIn` and the current segment is `(auth)`: replace with `/` (Home).

A `401` from any later request sets `signedOut` and the same rule sends the member to `/welcome`. There is no per-screen auth check; the gate is the one place.

## Deep links

The URL scheme is `vegangrove`. Routes map directly: `vegangrove://places/<slug>`, `vegangrove://events/<slug>`, `vegangrove://groves/<slug>`. The magic-link email points at the web page from `MAGIC_LINK_BASE_URL`; on a phone that page offers an "open in app" link to `vegangrove://auth/magic?token=...`, which `(auth)/magic-link.tsx` handles by calling verify and letting `AuthGate` do the rest. Universal links and App Links on `vegangrove.org`, which would skip the web hop, are a roadmap item ([open questions](/roadmap/open-questions)). A deep link that lands while `signedOut` is remembered and replayed after sign-in.
