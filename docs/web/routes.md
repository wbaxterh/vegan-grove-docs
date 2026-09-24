---
title: Routes
description: Every route the web app serves, the authenticated area, why there is no profile route, and the machine-readable routes.
sidebar_position: 2
---

# Routes

Status: **Scaffolded 2026-09-24**

Every path the site answers, in three groups: public pages anyone can load, the `/app` area that needs a session, and the three text routes for crawlers and agents.

## Public

| Route | Renders | Data |
|---|---|---|
| `/` | landing: what Vegan Grove is, this week's public events, the map teaser | `GET /api/stats`, `GET /api/events` |
| `/places` | the map, filters by type and vegan level, a list for the current viewport | `GET /api/places?bbox=` from the browser as the map moves |
| `/places/[slug]` | one place: name, type, vegan level, address, hours, photos, reviews | `GET /api/places/:slug` |
| `/events` | upcoming public events by area and date | `GET /api/events` |
| `/events/[slug]` | one event: when, where as far as the organizer allows, who is hosting, RSVP count | `GET /api/events/:slug` |
| `/groves` and `/groves/[slug]` | groves by area, and a grove's description with its public events | `GET /api/groves` |
| `/media` and `/media/[slug]` | the documentary and film library, click-to-load trailers | `GET /api/media` |
| `/guides` and `/guides/[slug]` | outreach, rights, vegan 101, sanctuary, nutrition | `GET /api/guides` |
| `/login`, `/signup` | forms posting to the session route handler | |
| `/privacy`, `/terms` | static | |

Public pages are server-rendered, never carry a session, and are cacheable. Nothing on them is personalized.

## Authenticated: `/app`

`src/app/app/layout.tsx` renders the member shell and is behind `middleware.ts`, which redirects a request without the `vg_session` cookie to `/login?next=<path>`. Inside:

| Route | Purpose |
|---|---|
| `/app/feed` | friends, grove, or public scope |
| `/app/messages` | conversations, Socket.IO for live updates |
| `/app/friends` | friends, requests, invite codes |
| `/app/companion` | Ivy, streaming over SSE |
| `/app/settings` | handle, avatar, home area, the privacy switches, sessions, delete account |

All five are stubs in the scaffold: the layout, the gate, and the navigation exist; the screens render placeholders.

## There is no profile route

There is no `/u/[handle]`, no `/members`, no `/app/profile/[id]`. Profiles are never public ([ADR 0004](/architecture/adrs/adr-0004-profiles-never-public)), and a member's own profile is `/app/settings`. If a public-posts view ships later it will read `GET /api/handles/:handle/posts`, show the handle, the avatar, and those posts, and nothing else: no bio, no area, no friends, no counts, and it will not be called a profile.

## Machine-readable routes

**`/robots.txt`** (`src/app/robots.ts`): allow everything public, disallow `/app` and `/api`, point at the sitemap. Generated so the sitemap URL follows `NEXT_PUBLIC_SITE_URL`.

**`/sitemap.xml`** (`src/app/sitemap.ts`): the static public routes plus every approved place, published event, grove, media item, and guide, fetched from the API at request time and revalidated hourly. Nothing under `/app`, and no handle pages, because there are none.

**`/llms.txt`** (`src/app/llms.txt/route.ts`): a plain-text description of the site for language-model agents, with the public routes and a link to [these docs](/intro). It says what the site is and where the public data lives; it does not enumerate members or anything behind a session.

## Not found and errors

`not-found.tsx` and `error.tsx` at the app root render on the site's own shell. A place or event the API answers `404` for, whether missing or not visible to the caller, renders the same not-found page; the web app does not try to tell the difference, matching the [error-handling rule](/engineering/error-handling).
