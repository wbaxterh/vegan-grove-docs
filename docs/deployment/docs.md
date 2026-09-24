---
title: Docs deployment
description: How this site builds and publishes on AWS Amplify Hosting, why the build installs a browser, and the strict-URL guard.
sidebar_position: 5
---

# Docs deployment

Status: **Scaffolded 2026-09-24**

This site is a PokeDocs (Docusaurus) build published by AWS Amplify Hosting on every push to `main`, from the same AWS account and region (`us-east-1`) as the web app. The build spec is `amplify.yml` in the repo root; CI on pull requests stays on GitHub Actions.

## Two pipelines

| Trigger | Runs where | Does |
|---|---|---|
| Pull request to `main` | GitHub Actions, `ci.yml` | `validate` (Biome, `tsc`, `pokedocs check`, `docusaurus build`) and `secrets` (gitleaks). The ruleset requires `validate` green before merge. |
| Push to `main` | Amplify Hosting | Builds the static site from `amplify.yml` and publishes it. A failed build leaves the previous deploy live. |

## The Amplify build

```yaml
preBuild:
  - nvm use 24
  - npm ci
  - sudo dnf install -y --setopt=strict=0 <chromium shared libraries>
  - npx playwright install chromium-headless-shell
build:
  - npm run build
artifacts: build/
cache: node_modules/, ~/.cache/ms-playwright/
```

Amplify's Amazon Linux 2023 image ships Node 22 by default and 24 through `nvm`, so the first line matches `.nvmrc`. The `dnf` line installs the shared libraries chromium needs, because Playwright's own `--with-deps` does not know Amazon Linux. The browser download is cached between builds.

## Why a docs build installs a browser

Mermaid diagrams are rendered to SVG at build time in a headless chromium, so the published page carries no client-side Mermaid runtime and no diagram that fails to draw when a script is blocked. Locally, run `npx playwright install chromium` once.

## `POKEDOCS_STRICT_URL`

`docusaurus.config.ts` reads `url` from `POKEDOCS_URL`, defaulting to `https://docs.vegangrove.org`, and `baseUrl` from `POKEDOCS_BASE_URL`. A production build with a placeholder URL only warns; setting `POKEDOCS_STRICT_URL=true` in the Amplify environment turns that into an error so a misconfigured environment cannot publish a sitemap and canonical links pointing at the wrong origin.

## Custom domain

Until `docs.vegangrove.org` is registered and attached, the site is served from Amplify's default `amplifyapp.com` hostname. Attaching the domain is an Amplify console step (Hosting, Custom domains) that issues the certificate and, when the zone is in Route 53, writes the records itself. HTTPS is enforced by Amplify by default, which is the step The Trick Book's docs site never took on its previous host.

## Local

```bash
npm run start       # dev server with hot reload, no Mermaid prerender
npm run validate    # exactly what CI runs
npm run serve       # serve build/ to check the production output
```

`onBrokenLinks: 'throw'` and the required `description` field mean a broken link or missing frontmatter fails `validate` locally before it fails CI. See [testing](/engineering/testing).

## Rollback

Amplify keeps every successful deploy; a bad page is fixed forward with a PR, and a build that fails never replaces the live site. The console can also redeploy any previous successful build in one click.
