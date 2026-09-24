---
title: Amplify deploy
description: The amplify.yml build spec line by line, the security headers next.config.ts ships, and the content security policy origins.
sidebar_position: 4
---

# Amplify deploy

Status: **Scaffolded 2026-09-24**

The where and when of web deployment is in [web app deployment](/deployment/web-app). This page is the repo side: the build spec and the headers the app ships with.

## `amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 24
        - npm ci
        - env | grep -E '^NEXT_PUBLIC_' >> .env.production
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

- `nvm use 24`: the Amplify image ships several Node versions; this matches `.nvmrc`.
- `npm ci`: exact lockfile install. A lockfile drift fails here, which is the point.
- `env | grep -E '^NEXT_PUBLIC_' >> .env.production`: the allowlist. Amplify console variables are present in the build shell but not in the SSR runtime; Next reads `.env.production` at build and inlines `NEXT_PUBLIC_*` into both bundles. Only that prefix passes, so a server-only value set in the console cannot reach the client. There are no server-only values in this app today, and the grep keeps it that way.
- `npm run build`: `next build --turbopack`. `validate` runs the same command, so a build that passes CI passes Amplify.
- `baseDirectory: .next`: WEB_COMPUTE reads the standalone output from here.
- `cache`: modules and the Next compiler cache, keyed by Amplify per branch.

## Security headers

`next.config.ts` returns these for every route from `headers()`:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=(), usb=()` |
| `X-Frame-Options` | `DENY`, redundant with the CSP `frame-ancestors` for older browsers |
| `Content-Security-Policy` | below |

`geolocation=(self)` because the places page asks the browser for a position to center the map; the value stays in the page and goes nowhere.

## Content security policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://tiles.openfreemap.org <media CDN>;
connect-src 'self' https://api.vegangrove.org wss://api.vegangrove.org https://tiles.openfreemap.org;
media-src 'self' blob: https://*.b-cdn.net;
frame-src https://www.youtube-nocookie.com;
worker-src 'self' blob:;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

Origins, and why each is there:

- **`api.vegangrove.org`** (https and wss): the API and the Socket.IO `/messages` namespace.
- **`tiles.openfreemap.org`**: the map style, glyphs, sprites, and vector tiles. MapLibre fetches them with `fetch` and loads sprites as images, hence both `connect-src` and `img-src`.
- **`*.b-cdn.net`**: Bunny Stream delivers HLS from its CDN. If the Bunny iframe player is used instead of a native `<video>` with HLS, its player origin is added to `frame-src`.
- **`www.youtube-nocookie.com`**: media-library trailers, click to load, never autoplayed, never on the page until tapped.
- **the media CDN**: the CloudFront distribution in front of the S3 image bucket. Its hostname is set from `NEXT_PUBLIC_MEDIA_BASE_URL` at build so the policy does not hard-code a distribution.
- **`blob:` and `worker-src`**: MapLibre runs its tile workers from blob URLs.

`'unsafe-inline'` on scripts is the one weak spot: Next's hydration and the theme script are inline. Moving to a nonce-based policy set in `middleware.ts` is on the [roadmap](/roadmap/open-questions). No third-party script, font, or analytics origin appears anywhere in the policy, and adding one is a PR that must name the [ADR](/architecture/adrs/adr-0007-no-third-party-analytics) it is overriding.
