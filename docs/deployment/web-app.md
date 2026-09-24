---
title: Web app deployment
description: Amplify Hosting for the Next 15 app, the amplify.yml contract, the environment variables, and the custom domain.
sidebar_position: 3
---

# Web app deployment

Status: **Proposed 2026-09-24**

`vegan-grove-web` deploys to AWS Amplify Hosting in `us-east-1` on the WEB_COMPUTE platform, which runs Next.js server components and route handlers rather than exporting static HTML. The session route handler and `middleware.ts` need that; a static export would not have a server to set the cookie.

## What deploys when

| Branch | Amplify branch | URL | Trigger |
|---|---|---|---|
| `main` | `main` (production) | `https://vegangrove.org` | every push to `main`, which after squash merge means every merged PR |
| feature branches | none by default | | pull-request previews can be enabled per app, off in the scaffold |

Previews are off because each one is a compute environment that costs money and shows unreviewed work at a public URL. Turn them on when there is a second contributor. The `staging` promotion pattern described in the [development workflow](/engineering/development-workflow) is the step before that.

Merging is not the same as live. Wait for the Amplify job for the merged SHA to report success, then load the changed route.

## Next version

Amplify's WEB_COMPUTE supports a range of Next.js majors that includes 15. Before any major Next upgrade, check the Amplify Hosting Next.js support matrix; a version outside it builds locally and fails on Amplify with an unhelpful message.

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

The `env | grep` line is the allowlist. Amplify's console variables are available to the build shell but not to the SSR runtime; writing the `NEXT_PUBLIC_` ones into `.env.production` at preBuild bakes them into the bundle and the server. Only the public prefix is allowed through, so a server-only secret set in the console by mistake never lands in a client bundle. [Amplify deploy](/web/amplify-deploy) explains each line.

## Environment variables

Set in the Amplify console for the `main` branch. Names only here; there are no server-side secrets in the web app because the API holds all of them.

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | the API origin, `https://api.vegangrove.org`; used by the browser client and by server components |
| `NEXT_PUBLIC_SITE_URL` | the canonical site origin for `sitemap.xml`, `robots.txt`, `llms.txt`, and metadata |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | the CloudFront origin for images, used by `next/image` and the CSP `img-src` |

`check-prod-ready` has no web equivalent; `next build` fails on a missing `NEXT_PUBLIC_API_BASE_URL` because the API client throws at module load when it is unset.

## Custom domain

`vegangrove.org` and `www.vegangrove.org` are added to the Amplify app as a custom domain. Amplify requests an ACM certificate and validates it through Route 53 records it creates in the hosted zone; `www` redirects to the apex. Once the certificate is issued, both hostnames serve the `main` branch over HTTPS with the HSTS header from `next.config.ts`.

## Rollback

Amplify keeps previous builds per branch. Redeploying an earlier successful job from the console rolls back without a git revert. Do the git revert as well, so `main` matches what is live.
