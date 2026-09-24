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
| Map | MapLibre GL with the OpenFreeMap `liberty` style, loaded with `dynamic(..., { ssr: false })` |
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
    layout.tsx               html, ThemeProvider, header, footer
    page.tsx                 /
    places/  events/  groves/  media/  guides/    public lists and [slug] pages
    login/  signup/  privacy/  terms/
    app/                     authenticated area: layout.tsx plus feed, messages, friends, companion, settings
    api/session/route.ts     sets and clears the vg_session cookie
    robots.ts  sitemap.ts    generated at request time
    llms.txt/route.ts
  components/
    ui/                      shadcn/ui, generated, edited in place
    map/PlacesMap.tsx        client component, dynamic import wrapper beside it
    ...
  lib/
    api.ts                   the HTTP client, server and browser
    session.ts               cookie name, read helper for server components
    utils.ts                 shadcn's cn()
  middleware.ts              redirects /app/* without a cookie to /login
  styles/globals.css         tokens, Tailwind layers
next.config.ts               security headers, CSP
amplify.yml
playwright.config.ts
tests/e2e/smoke.spec.ts
```

The [routes](/web/routes) page lists every path and what it serves. [Amplify deploy](/web/amplify-deploy) covers `amplify.yml` and the headers.

## Scripts

```bash
npm run dev          # next dev --turbopack
npm run validate     # biome check, tsc --noEmit, next build
npm run test:e2e     # playwright test against a built app
```

## Rendering rules

Public pages are server components that call the API without a session and cache with `revalidate`. Pages under `/app` are server components that forward the cookie as a Bearer header for the first render, then hand interactive parts to client components that call the API through the same `src/lib/api.ts` in the browser. The map is the only page that is client-only from the top, because MapLibre needs `window`.
