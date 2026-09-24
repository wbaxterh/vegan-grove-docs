---
title: State and data
description: One zustand store for auth, TanStack Query for everything from the server, and the short list of what is persisted on the device.
sidebar_position: 3
---

# State and data

Status: **Scaffolded 2026-09-24**

Two kinds of state, two tools, and a deliberately short list of what survives an app restart. The rule that decides most questions here: the server is the source of truth for anything about a member, and the device holds only what it needs to ask the server.

## Auth: zustand

`src/lib/stores/authStore.ts` is the only zustand store. It holds:

```ts
{
  status: 'restoring' | 'signedOut' | 'signedIn',
  user: User | null,          // the GET /api/me shape
  token: string | null,       // in memory, mirrored to SecureStore
  restore(), signIn({ token, user }), signOut(), refreshUser()
}
```

`signIn` writes the token to SecureStore and sets `signedIn`. `signOut` calls `POST /api/auth/logout` (best effort), deletes the SecureStore entry, clears the TanStack Query cache, and sets `signedOut`. `restore` is called once by `AuthGate` ([navigation](/mobile/navigation)). No other UI state lives in zustand; a screen's local state is `useState`.

## Server data: TanStack Query

Every read from the API goes through a query with a key per resource, so invalidation after a mutation is a one-liner and screens never hold their own copies.

| Key | Fetches | Notes |
|---|---|---|
| `['me']` | `GET /api/me` | `staleTime` long; refreshed after PATCH |
| `['places', bbox, { type, q }]` | `GET /api/places?bbox=` | keyed on the rounded viewport so panning a few meters reuses the cache |
| `['place', slug]` | `GET /api/places/:slug` | |
| `['events', { from, to, area, groveId }]` | infinite query over `nextCursor` | |
| `['event', slug]` | | |
| `['feed', scope]` | infinite query | `scope` is `friends`, `grove:<id>`, or `public` |
| `['conversations']`, `['messages', conversationId]` | | messages also arrive over Socket.IO and are merged into the cache |
| `['friends']`, `['friendRequests']` | | |
| `['media', filters]`, `['guides', category]` | public, long `staleTime` | |

Mutations (`useMutation`) invalidate the keys they affect and nothing broader. Lists use `useInfiniteQuery` with `getNextPageParam: (last) => last.nextCursor ?? undefined`, matching the API's cursor contract. The query client is created once in `app/_layout.tsx` with a default `staleTime` of a minute and `retry: 1`; a `401` inside a query calls `authStore.signOut()` from the client's `onError`.

The query cache is memory only. There is no `persistQueryClient`; on restart the app refetches, which is a few small requests.

## Persisted on the device

| What | Where | Why |
|---|---|---|
| Session token | `expo-secure-store` | the Keychain or Keystore, encrypted by the OS, unavailable to other apps and to backups |
| Theme preference (`system`, `dark`, `light`) | AsyncStorage | a UI preference with no privacy weight; added with the theme toggle, not in the scaffold's dependencies yet |

That is the whole list. Not persisted: the member object (refetched from `['me']`), any query cache, drafts, the last map position, location, or friends. A stolen or shared device yields one revocable token and a theme.

## Location

`expo-location` is requested when-in-use the first time the places tab mounts, to center the map. The coordinate is passed to the map component and dropped. It is never stored, never put in a query key as itself (the key holds the bounding box the viewport settled on, which is what the API receives), and never sent anywhere else. Denying the permission leaves the map on its default Southern California view.
