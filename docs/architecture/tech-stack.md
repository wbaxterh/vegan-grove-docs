---
title: Tech stack
description: Every runtime, framework, library, and design token Vegan Grove uses, with the version policy and the reason for each choice.
sidebar_position: 3
---

# Tech stack

Status: **Scaffolded 2026-09-24**

## Runtimes and frameworks

| Layer | Choice | Version policy | Why |
|---|---|---|---|
| Node | 24 LTS | `.nvmrc` in every repo | Current LTS on the dev box; The Trick Book's Node 20 line hit a `jsonwebtoken` crash on 24, which we avoid by not using that library |
| API | Express 5, TypeScript, ESM | Exact pins in `package.json`, Dependabot weekly | The Trick Book pattern, typed |
| ORM | Mongoose 9 | | Schemas with declared indexes, the single biggest debt fix over The Trick Book's schema-less collections |
| Validation | zod | | Route-boundary validation with typed inference |
| Logging | pino, pino-http | | JSON logs with redaction |
| Realtime | Socket.IO 4 | | Namespaces and rooms, same shape as The Trick Book |
| Web | Next 15 (App Router), React 19, Tailwind 4, shadcn/ui, next-themes | Exact `next` pin; Amplify supports 12 to 15 | SSR for public pages, SEO for places and events |
| Maps (web) | maplibre-gl | | No Google SDK, no key |
| Mobile | Expo SDK 57, expo-router, React Native, TypeScript | Upgrade one SDK at a time | Current Expo, same navigation model as The Trick Book v2 |
| Maps (mobile) | `@maplibre/maplibre-react-native` | | Needs a dev client; Expo Go will not load it |
| State (mobile) | zustand (auth only), TanStack Query (server data) | | The Trick Book mounted Query and never used it; here it is the only fetch path |
| Docs | PokeDocs preset on Docusaurus 3.10 | | Build-time mermaid, one-config branding, `llms.txt` and `.md` twins for agents |
| Lint and format | Biome 2.5 | Exact pin, schema pinned | One tool, fast, same config in four repos |
| Tests | vitest, supertest, mongodb-memory-server (API); Playwright (web) | | |
| Secrets hygiene | secretlint (pre-commit), gitleaks (CI), GitHub push protection | | See [ADR-0009](/architecture/adrs/adr-0009-public-repos) |

## Services

| Need | Service | Notes |
|---|---|---|
| Database | MongoDB Atlas M0 | Free tier, 512 MB, allowlisted to the API host's IP ([ADR-0008](/architecture/adrs/adr-0008-database)) |
| API hosting | EC2 t4g.micro, Ubuntu 24.04 arm64, PM2, nginx, certbot | [ADR-0002](/architecture/adrs/adr-0002-backend-hosting) |
| Web hosting | AWS Amplify Hosting (WEB_COMPUTE) | Auto-deploys `main` |
| Images | S3 (private bucket) + CloudFront | Presigned PUT, public read through the CDN |
| Video | Bunny Stream | TUS upload, HLS playback, signed URLs for non-public posts ([ADR-0013](/architecture/adrs/adr-0013-media-pipeline)) |
| Email | SES SMTP | Magic links and account mail |
| Push | Expo push service | |
| Map tiles | OpenFreeMap public instance | No key, no cookies, no personal data ([ADR-0006](/architecture/adrs/adr-0006-maps)) |
| Companion | Anthropic API | Streaming, model from config ([ADR-0012](/architecture/adrs/adr-0012-companion)) |
| SSO | Sign in with Apple, Google Identity | Email from the verified token only |
| DNS and certs | Route 53, ACM (Amplify), certbot (API) | |
| Mobile builds | EAS Build free tier | 30 builds a month |
| Docs hosting | GitHub Pages | |

## Design tokens

The same values live in the web CSS, the mobile `tokens.ts`, and this site's `custom.css`.

| Token | Value | Use |
|---|---|---|
| `--vg-bg` | `#0B0F0C` | Dark background, near-black with a green cast |
| `--vg-surface` | `#121A15` | Cards and panels |
| `--vg-text` | `#E6F2EA` | Body text on dark |
| `--vg-muted` | `#8FA89A` | Secondary text |
| `--vg-primary-dark` | `#3DFF8A` | Neon green, primary in dark mode |
| `--vg-primary-light` | `#0E7C3A` | Deep green, primary in light mode |
| `--vg-accent` | `#FF2BD6` | Magenta, sparingly |
| `--vg-accent-2` | `#22E5FF` | Cyan, links and focus rings |
| `--vg-danger` | `#FF4D4D` | Errors |

Fonts are the system UI stack for body and the system monospace stack for labels, badges, and headings that carry the cyberpunk feel. No third-party font or icon CDN anywhere: fonts are a tracking vector and an availability dependency, and the system stacks look right on every platform.

## Deliberately absent

Google Maps SDK, PostHog, Google Analytics, Sentry with PII, Stripe, any LLM router that spreads prompts across providers, Docker Desktop on the dev box, and a monorepo tool. Each absence is a decision, most of them recorded in the [ADRs](/architecture/adrs).
