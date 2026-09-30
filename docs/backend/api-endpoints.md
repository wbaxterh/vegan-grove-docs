---
title: API endpoints
description: The v1 API surface grouped by resource with the auth level of each route, and which groups the scaffold implements.
sidebar_position: 2
---

# API endpoints

Status: **Scaffolded 2026-09-24**, ingest endpoint and public reads added 2026-09-29 per the [ingest contract](/ingest)

All routes live under `/api` on `https://api.vegangrove.org`; health is `/healthz`. Auth is `Authorization: Bearer <session token>`. Every error is `{ error: { code, message } }` ([error handling](/engineering/error-handling)). Every list is `{ items, nextCursor }` with an opaque cursor over `_id`; there is no `page` or `skip`, and a bad cursor is a `400 invalid_cursor`.

Auth levels: **public** (no session), **member** (any session), **organizer** (grove organizer or organization admin for the host), **admin** (`role: admin`, checked in the database per request), **ingest** (the `X-Ingest-Key` header, compared in constant time against `INGEST_KEY`; it writes only through `/api/ingest/*` and reads nothing).

**Scaffold status:** auth, me, places, admin place approval, healthz, stats, the public reads for events, organizations, groves, media, and guides, and the ingest endpoint are implemented with tests. Every other route is mounted, validates its input, and returns `501 { error: { code: 'not_implemented' } }` until its milestone ([milestones](/roadmap/milestones)).

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

Place and event responses carry `location` as `{ lng, lat }`. GeoJSON (`{ type: 'Point', coordinates: [lng, lat] }`) exists only inside the database for the 2dsphere index; clients never see or send it. Bounding boxes go in as `bbox=west,south,east,north`. The web smoke test renders a marker from a fixture in exactly this shape so the two repos cannot drift apart silently again.


| Route | Auth | Note |
|---|---|---|
| `GET /api/places?bbox=w,s,e,n&type=&veganLevel=&includeChains=&q=&cursor=&limit=` | public | approved places only; `veganLevel` defaults to `full`, chains hidden unless `includeChains=true`, fully vegan places sort first |
| `GET /api/places/map-pins?bbox=w,s,e,n&type=&veganLevel=&includeChains=` | public | pins only (`slug`, `name`, `type`, `veganLevel`, `chain`, `location`), no cursor, capped at 1,000 with `truncated: true` past the cap |
| `GET /api/places/:slug` | public | the full record with `phone`, `postcode`, `hours`, `tags`, and the source attribution |
| `POST /api/places` | member | created as `pending` |
| `GET`, `POST /api/places/:id/reviews` | public, member | 501 |
| `GET`, `POST /api/place-lists`, `PATCH`, `DELETE /api/place-lists/:id` | member | private by default, 501 |

## Events, groves, organizations (public reads implemented)

| Route | Auth | Note |
|---|---|---|
| `GET /api/events?from=&to=&area=&type=&groveId=&cursor=&limit=` | public | published only, visibility-filtered by caller, upcoming first |
| `GET /api/events/:slug` | public | |
| `POST /api/events`, `PATCH /api/events/:id` | organizer | |
| `POST`, `DELETE /api/events/:id/rsvp` | member | |
| `GET /api/events/:id/attendees` | organizer | everyone else sees counts only |
| `GET /api/groves`, `GET /api/groves/:slug` | public | the ten regional Groves, member counts only |
| `POST /api/groves/:id/join`, `DELETE /api/groves/:id/leave` | member | |
| `GET /api/organizations?type=&area=&q=&cursor=&limit=`, `GET /api/organizations/:slug` | public | verified first; `adminUserIds` never in the response |

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
| `GET /api/media/home` | public | `{ hero, rows }`: featured titles in a deterministic daily order, editor shelves, automatic rows; cached 5 minutes; implemented |
| `GET /api/media?q=&kind=&tag=&year=&free=&maxRuntime=&sort=&cursor=&limit=` | public | published only; `sort` is `featured` (default), `release`, `title`, `rating` or `runtime`; keyset cursor; implemented |
| `GET /api/media/collections`, `GET /api/media/collections/:slug` | public | published shelves, four preview items on the list; implemented |
| `GET /api/media/:slug` | public, session optional | `{ media }`, plus `viewer { saved, reactions }` with a session (then `private, no-store`); implemented |
| `GET /api/media/:slug/related` | public | up to 12 titles sharing a topic or genre; implemented |
| `POST` and `DELETE /api/media/:id/save` | member | idempotent watchlist toggle; `GET /api/me/watchlist` lists it; implemented |
| `POST /api/media/:id/reactions` `{ type }`, `DELETE /api/media/:id/reactions/:type` | member | `moved` or `acted`; answers `{ stats, viewer }`; implemented |
| `GET /api/guides?category=&cursor=&limit=`, `GET /api/guides/:slug` | public | published only; implemented |
| `GET`, `POST /api/actions`, `DELETE /api/actions/:id` | member | private log |
| `POST /api/companion/chat` `{ conversationId?, message }` | member | SSE stream, rate limited |
| `GET /api/companion/conversations`, `POST .../:id/pin`, `DELETE .../:id` | member | |

## Ingest (implemented 2026-09-29)

| Route | Auth | Note |
|---|---|---|
| `POST /api/ingest/:resource` `{ source, items[] }` | ingest or admin | `resource` is `places`, `events`, `organizations`, `media`, or `guides`; at most 200 items; upsert on `(source, sourceId)` |

Responses: `200 { inserted, updated, unchanged, rejected: [] }` when every item was written, `207` with `rejected: [{ index, sourceId, errors }]` when some were not, `400 validation_error` for a bad envelope, `401 unauthorized` for a wrong key, `429 rate_limited` past 60 calls per 15 minutes per key, `503 not_configured` until `INGEST_KEY` is set. The item schemas and the moderation rules are in [Data ingest](/ingest).

## List query parameters

Every list takes `cursor` and `limit` (1 to 100, default 50). The rest are per resource.

| List | Filters | Defaults |
|---|---|---|
| `/api/places` | `bbox` (required), `type`, `veganLevel` (`full`, `options`, `all`), `includeChains`, `q` | `veganLevel=full`, `includeChains=false`, `full` sorts first |
| `/api/places/map-pins` | as places, without `q` and without a cursor | capped at 1,000 |
| `/api/events` | `from`, `to`, `area`, `type`, `groveId` | upcoming, published, visible to the caller |
| `/api/organizations` | `type`, `area`, `q` | verified first |
| `/api/groves` | none | all |
| `/api/media` | `q`, `kind`, `tag`, `year`, `free`, `maxRuntime`, `sort` | published; five sorts, all keyset |
| `/api/guides` | `category` | published |

## Admin

| Route | Auth | Note |
|---|---|---|
| `GET /api/admin/places/pending`, `PUT /api/admin/places/:id/approve`, `.../reject` | admin | implemented |
| `GET`, `POST /api/admin/media`, `PATCH`, `DELETE /api/admin/media/:id` | admin | every status; a hand-set field is locked against ingest; implemented |
| `GET`, `POST /api/admin/media/collections`, `PATCH /api/admin/media/collections/:id` | admin | shelves with an ordered `itemIds`; implemented |
| CRUD `/api/admin/guides` | admin | 501 |
| `GET /api/admin/reports`, `PUT /api/admin/reports/:id` | admin | 501 |
