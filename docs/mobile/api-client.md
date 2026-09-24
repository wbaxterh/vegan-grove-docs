---
title: API client
description: The ENDPOINTS registry, the fetch wrapper's behavior for auth, timeouts, and errors, and the one environment variable it reads.
sidebar_position: 4
---

# API client

Status: **Scaffolded 2026-09-24**

All network access goes through one function. Screens and hooks never call `fetch` and never build a URL string; they pick an entry from `ENDPOINTS` and pass it to `request`. That keeps the auth header, the timeout, and the error shape in one file, and makes "which routes does the app call" a grep.

## `src/constants/api.ts`

```ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) throw new Error('EXPO_PUBLIC_API_BASE_URL is not set');

export const ENDPOINTS = {
  auth: { register: '/api/auth/register', login: '/api/auth/login', magicLink: '/api/auth/magic-link', ... },
  me: { root: '/api/me', sessions: '/api/me/sessions', session: (id: string) => `/api/me/sessions/${id}` },
  places: { list: '/api/places', bySlug: (slug: string) => `/api/places/${slug}`, ... },
  events: { ... }, groves: { ... }, friends: { ... }, feed: { ... }, posts: { ... },
  conversations: { ... }, media: { ... }, guides: { ... }, actions: { ... }, companion: { ... },
} as const;
```

The registry mirrors the [API endpoints](/backend/api-endpoints) one for one. Adding a route to the API means adding it here in the same PR; the registry is typed, so a typo in a screen is a compile error. Paths are relative; `request` prepends the base URL.

`EXPO_PUBLIC_API_BASE_URL` is inlined at build time by Expo. It comes from `.env` locally and from the EAS profile's `env` block for builds. It is the value `check-prod-ready.sh` guards against being `localhost` in a store build ([build and release](/mobile/build-and-release)).

## `src/lib/api/client.ts`

```ts
request<T>(path: string, options?: {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
  timeoutMs?: number;     // default 15000
}): Promise<T>
```

Behavior, in order:

1. **Auth header.** Unless `skipAuth`, read the token from `authStore` (already in memory after restore; SecureStore is not hit per request) and set `Authorization: Bearer <token>`. `skipAuth` is for register, login, magic link, and public reads before sign-in. A request without a token and without `skipAuth` is rejected locally with `unauthenticated` rather than sent.
2. **Body.** `JSON.stringify` with `Content-Type: application/json`. No `FormData`: images go to S3 with a presigned URL from `POST /api/uploads/image/presign`, video to Bunny.
3. **Timeout.** An `AbortController` fires at `timeoutMs`. The abort becomes `{ status: 0, code: 'timeout' }`.
4. **Response.** `2xx` with a body parses to `T`; `204` resolves `undefined`. Anything else is normalized and thrown.

## Error normalization

Every failure is an `ApiError` with `{ message, status, code }`:

| Source | `status` | `code` |
|---|---|---|
| API envelope `{ error: { code, message } }` | the HTTP status | the envelope's code |
| Non-JSON response (proxy error page) | the HTTP status | `http_error` |
| Timeout | `0` | `timeout` |
| No network, DNS, TLS | `0` | `network_error` |

This is the same table the web client uses ([error handling](/engineering/error-handling)).

## 401 and 403

A `401` means the session is gone: the client calls `authStore.signOut()` once (guarded so ten parallel failures do not sign out ten times) and `AuthGate` sends the member to the welcome screen. The `ApiError` is still thrown so the calling query settles.

A `403` is not a session problem. It is thrown to the screen, which renders a denied state (an organizer-only list, an admin route). It never signs out. A `404` on a resource the member expected is rendered as "not available" without distinguishing missing from hidden, matching the API's own rule.

## Retries

None inside the client. TanStack Query retries reads once; mutations do not retry. A `429 rate_limited` carries `Retry-After` and the screen shows it.
