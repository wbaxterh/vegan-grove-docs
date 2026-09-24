---
title: Web overview
description: The Next 15 app's stack, what it deliberately leaves out, and the source layout.
sidebar_position: 1
---

# Web overview

Status: **Scaffolded 2026-09-24**

`vegan-grove-web` is the public face and the browser client: `vegangrove.org` for anyone, `/app` for signed-in members. It is a Next 15 App Router application deployed on Amplify Hosting ([web app deployment](/deployment/web-app)). It renders public content on the server for reach and privacy (no client-side data fetching for public pages means no member token on public pages) and behaves as a normal client app under `/app`.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next 15, App Router, TypeScript, `src/` directory, Turbopack |
| Styling | Tailwind 4, shadcn/ui components generated into the repo, `--vg-*` tokens in `globals.css` |
| Theme | `next-themes`, class strategy, dark by default, light must work |
| Map | MapLibre GL with the OpenFreeMap `liberty` style, loaded with `dynamic(..., { ssr: false })`. Its tile worker is self-hosted under `public/maplibre/` (copied on `prebuild`) because Turbopack hashes the worker and its shared chunk separately, which breaks the worker's relative import and leaves the map blank. |
| Lint, format | Biome (the `create-next-app` ESLint option was declined) |
| E2E | Playwright smoke in `test:e2e`, outside `validate` |
| Fonts | system UI and system monospace stacks; `next/font` is not used |

## What is deliberately absent

- **No analytics.** No GA, PostHog, Vercel Analytics, or Speed Insights. Aggregate numbers come from `GET /api/stats`. See [ADR 0007](/architecture/adrs/adr-0007-no-third-party-analytics).
- **No external fonts or icon CDNs.** A font request to a third party is a page-view log at that third party. Icons are inlined SVG from a local set.
- **No server-side secrets.** The web app has no database, no AWS credentials, no API key. Everything it needs it asks the API for with the member's own session. The one environment variable that matters is `NEXT_PUBLIC_API_BASE_URL`.
- **No token in JavaScript.** The session is an httpOnly cookie ([auth and sessions](/web/auth-and-sessions)).
- **No `pages/` directory**, no `getServerSideProps`; everything is App Router.

## Layout

```
src/
  app/
    (site)/                public pages under the shared header and footer, plus login and signup
    app/                   member area: the layout validates the session, then feed, messages, friends, companion, settings
    api/session/route.ts   the only code that sees the session token; sets and clears vg_session
    llms.txt/ robots.txt/ sitemap.xml/   route handlers built from src/lib/site.ts
    globals.css            the --vg-* tokens mapped onto shadcn variables; no other file defines a color
    layout.tsx             html, ThemeProvider (dark by default), system font stacks
    not-found.tsx
  components/
    ui/                    shadcn components on Base UI, regenerated with the shadcn CLI
    places/                places-map.tsx (MapLibre, client only) and its dynamic-import island
    auth/ app/ events/ media/   forms, member nav, cards, the youtube-nocookie trailer embed
    screen.tsx             the Context / Action / Support layout every page uses
  lib/
    api.ts                 apiFetch, the one HTTP client for browser and server
    api.server.ts          forwards the cookie as a Bearer header for server components
    session.ts             cookie name and options, shared with the middleware
    loaders.ts             public-page loaders that never turn an API outage into a 500
  middleware.ts            redirects /app/* without a cookie to /login?next=
public/maplibre/           MapLibre worker files, copied on predev and prebuild, gitignored
scripts/                   copy-maplibre-worker.mjs
tests/                     smoke.spec.ts (Playwright)
next.config.ts             CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy
amplify.yml                Node 24, env allowlist into .env.production, npm ci, next build
```

The [routes](/web/routes) page lists every path and what it serves. [Amplify deploy](/web/amplify-deploy) covers `amplify.yml` and the headers.

## Scripts

```bash
npm run dev          # next dev --turbopack
npm run validate     # biome check, tsc --noEmit, next build
npm run test:e2e     # playwright smoke against the dev server
```

## Rendering rules

Public pages are server components that call the API without a session and cache with `revalidate`. Pages under `/app` are server components that forward the cookie as a Bearer header for the first render, then hand interactive parts to client components that call the API through the same `src/lib/api.ts` in the browser. The map is the only page that is client-only from the top, because MapLibre needs `window`.
