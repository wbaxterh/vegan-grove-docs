---
title: Introduction
description: What Vegan Grove is, how the platform is put together, and where to start reading.
sidebar_position: 1
---

# Vegan Grove documentation

Status: **Scaffolded 2026-09-24**

Vegan Grove is a privacy-first vegan community and activism platform for Southern California. Every member is an activist. The app helps them find sanctuaries, vegan businesses, and events, meet each other safely, and get out the door and act.

This site is public on purpose. The code, the data inventory, the threat model, and the roadmap are all here so anyone can check how member data is handled. What is never here: who the members are, or anything that identifies the machines the platform runs on. See the [disclosure policy](/privacy/disclosure-policy).

## Platform

| Component | Technology | Repo | Status |
|---|---|---|---|
| Backend API | Node 24, Express 5, TypeScript, Mongoose 9, Socket.IO | `vegan-grove-api` | Scaffolded |
| Web app | Next 15 (App Router), Tailwind 4, MapLibre | `vegan-grove-web` | Scaffolded |
| Mobile app | Expo SDK 57, expo-router, MapLibre | `vegan-grove-mobile` | Scaffolded |
| Docs | PokeDocs (Docusaurus) | `vegan-grove-docs` | This site |
| Database | MongoDB Atlas | | Not provisioned |
| Hosting | AWS `us-east-1`: EC2 + PM2, Amplify, S3, SES | | Provisioned: domains live, API host waiting on the database |

## Start here

- **Product:** [Vision](/product/vision), the [principles](/product/principles), and the [concept map](/product/concept-map) that explains how The Trick Book's ideas became Vegan Grove's.
- **Privacy:** the [promise](/privacy), the [data inventory](/privacy/data-inventory), and the [threat model](/privacy/threat-model).
- **Architecture:** the [overview](/architecture/overview), the [repo dependency map](/architecture/repo-dependency-map), and the [ADRs](/architecture/adrs).
- **Features:** [overview](/features/overview), then Places, Events, Groves, Friends, Feed, Messages, Media, Guides, Ivy, Notifications.
- **Engineering and deployment:** [engineering standards](/engineering/overview) and the [deployment overview](/deployment).

## Repositories

```
~/Documents/VeganGrove/repos
├── api/       vegan-grove-api      shared REST API + Socket.IO
├── web/       vegan-grove-web      Next.js site on Amplify
├── mobile/    vegan-grove-mobile   Expo React Native app
└── docs/      vegan-grove-docs     this site
```

Each repo carries the same governance files: `SOUL.md`, `PRODUCT-PRINCIPLES-CHECKLIST.md`, `AGENTS.md`, a PR template, `CODEOWNERS`, `SECURITY.md`, `CONTRIBUTING.md`, and a proprietary `LICENSE`. The code is public; redistribution is not permitted.

## Lineage

Vegan Grove mirrors the shape of [The Trick Book](https://thetrickbook.com), the same author's skate and snow app: four repos, one shared API, MongoDB, Amplify for the web, EAS for mobile, PokeDocs for docs. What changed is the data policy. The [concept map](/product/concept-map) lists every carried-over idea and its privacy rule.
