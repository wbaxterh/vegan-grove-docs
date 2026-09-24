---
title: API endpoints
description: The v1 API surface grouped by resource with the auth level of each route, and which groups the scaffold implements.
sidebar_position: 2
---

# API endpoints

Status: **Scaffolded 2026-09-24**

All routes live under `/api` on `https://api.vegangrove.org`; health is `/healthz`. Auth is `Authorization: Bearer <session token>`. Every error is `{ error: { code, message } }` ([error handling](/engineering/error-handling)). Every list is `{ items, nextCursor }` with an opaque cursor over `_id`; there is no `page` or `skip`, and a bad cursor is a `400 invalid_cursor`.

Auth levels: **public** (no session), **member** (any session), **organizer** (grove organizer or organization admin for the host), **admin** (`role: admin`, checked in the database per request).

**Scaffold status:** auth, me, places, admin place approval, healthz, and stats are implemented with tests. Every other route is mounted, validates its input, and returns `501 { error: { code: 'not_implemented' } }` until its milestone ([milestones](/roadmap/milestones)).

## Auth and account (implemented)

| Route | Auth | Note |
|---|---|---|
| `POST /api/auth/register` `{ email, password, handle }` | public | returns `{ token, user }`, rate limited |
| `POST /api/auth/login` `{ email, password }` | public | rate limited |
| `POST /api/auth/magic-link` `{ email }` | public | always `202`, no account enumeration |
| `POST /api/auth/magic-link/verify` `{ token }` | public | single use, 15 minute TTL |
| `POST /api/auth/apple` `{ identityToken, nonce }` | public | email from the token only, **501 in scaffold** |
| `POST /api/auth/google` `{ idToken }` | public | **501 in scaffold** |
| `POST /api/auth/logout` | member | deletes the session |
| `GET`, `PATCH`, `DELETE /api/me` | member | delete is the hard delete from [ADR 0010](/architecture/adrs/adr-0010-account-deletion) |
| `GET /api/me/sessions`, `DELETE /api/me/sessions/:id` | member | |
| `GET /api/me/notification-preferences`, `PUT` | member | 501 |
| `POST`, `DELETE /api/push-tokens` | member | 501 |

## Health and stats (implemented)

| Route | Auth | Note |
|---|---|---|
| `GET /healthz` | public | `{ ok: true }` after a DB ping, else `503` |
| `GET /api/stats` | public | aggregate counters, cached 5 minutes |

## Places (implemented)

| Route | Auth | Note |
|---|---|---|
| `GET /api/places?bbox=w,s,e,n&type=&q=&cursor=` | public | approved places only |
| `GET /api/places/:slug` | public | |
| `POST /api/places` | member | created as `pending` |
| `GET`, `POST /api/places/:id/reviews` | public, member | 501 |
| `GET`, `POST /api/place-lists`, `PATCH`, `DELETE /api/place-lists/:id` | member | private by default, 501 |

## Events, groves, organizations

| Route | Auth | Note |
|---|---|---|
| `GET /api/events?from=&to=&area=&groveId=&cursor=` | public | visibility-filtered by caller |
| `GET /api/events/:slug` | public | |
| `POST /api/events`, `PATCH /api/events/:id` | organizer | |
| `POST`, `DELETE /api/events/:id/rsvp` | member | |
| `GET /api/events/:id/attendees` | organizer | everyone else sees counts only |
| `GET /api/groves`, `GET /api/groves/:slug` | public | |
| `POST /api/groves/:id/join`, `DELETE /api/groves/:id/leave` | member | |
| `GET /api/organizations`, `GET /api/organizations/:slug` | public | `adminUserIds` never in the response |

## Friends, feed, posts

| Route | Auth | Note |
|---|---|---|
| `GET /api/friends`, `GET /api/friends/requests` | member | |
| `POST /api/friends/invites` | member | `{ code, expiresAt }` |
| `POST /api/friends/invites/:code/accept` | member | |
| `DELETE /api/friends/:userId` | member | |
| `GET /api/feed?scope=friends\|grove:<id>\|public&cursor=` | member | |
| `POST /api/posts`, `GET`, `DELETE /api/posts/:id` | member | a post the caller may not see is `404` |
| `POST`, `DELETE /api/posts/:id/reactions` | member | |
| `GET`, `POST /api/posts/:id/comments` | member | |
| `POST`, `DELETE /api/posts/:id/save` | member | |
| `GET /api/handles/:handle/posts` | public | public posts only, per [ADR 0004](/architecture/adrs/adr-0004-profiles-never-public) |
| `POST /api/reports` | member | |

## Uploads, messages, media, guides, actions, companion

| Route | Auth | Note |
|---|---|---|
| `POST /api/uploads/image/presign` `{ contentType, purpose }` | member | `{ url, key }`, S3 PUT |
| `POST /api/uploads/video/create` `{ title }` | member | `{ videoId, tusEndpoint, authorization }`, Bunny |
| `GET`, `POST /api/conversations` | member | |
| `GET`, `POST /api/conversations/:id/messages` | member | encrypted at rest, 90 day TTL |
| Socket.IO `/messages` | member | rooms `user:<id>`, `conversation:<id>` |
| `GET /api/media?kind=&tag=&cursor=`, `GET /api/media/:slug` | public | |
| `GET /api/guides?category=`, `GET /api/guides/:slug` | public | |
| `GET`, `POST /api/actions`, `DELETE /api/actions/:id` | member | private log |
| `POST /api/companion/chat` `{ conversationId?, message }` | member | SSE stream, rate limited |
| `GET /api/companion/conversations`, `POST .../:id/pin`, `DELETE .../:id` | member | |

## Admin

| Route | Auth | Note |
|---|---|---|
| `GET /api/admin/places/pending`, `PUT /api/admin/places/:id/approve`, `.../reject` | admin | implemented |
| CRUD `/api/admin/media`, CRUD `/api/admin/guides` | admin | 501 |
| `GET /api/admin/reports`, `PUT /api/admin/reports/:id` | admin | 501 |
