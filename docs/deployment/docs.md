---
title: Docs deployment
description: How this site builds and publishes to GitHub Pages, the custom domain, and the strict-URL guard.
sidebar_position: 5
---

# Docs deployment

Status: **Scaffolded 2026-09-24**

This site is a PokeDocs (Docusaurus) build published to GitHub Pages by GitHub Actions on every push to `main`. The workflows and the domain file are in the scaffold; enabling Pages on the repo is a one-time step after the first push.

## Workflows

`ci.yml` runs on pull requests: `validate` (Biome, `tsc`, `pokedocs check`, `docusaurus build`) and `secrets` (gitleaks). `deploy.yml` runs on push to `main` and on manual dispatch:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
```

The `build` job checks out, installs Node from `.nvmrc`, runs `npm ci`, restores the Playwright browser cache, installs chromium, and runs `npm run build` with `POKEDOCS_STRICT_URL=true`. It uploads `build/` with `include-hidden-files` so dot-directories such as `.well-known` survive. The `deploy` job publishes that artifact to the `github-pages` environment. Two pushes in a row cancel the older run.

## Why Playwright is in a docs build

Mermaid diagrams are rendered to SVG at build time in a headless chromium, so the published page has no client-side Mermaid runtime and no diagram that fails to draw when a script is blocked. `npx playwright install --with-deps chromium` is the cost, and the browser cache keyed on `package-lock.json` keeps it to a few seconds on repeat runs. Locally, run the same install once.

## `POKEDOCS_STRICT_URL`

`docusaurus.config.ts` reads `url` from `POKEDOCS_URL`, defaulting to `https://docs.vegangrove.org`, and `baseUrl` from `POKEDOCS_BASE_URL`. A production build with a placeholder URL only warns; `POKEDOCS_STRICT_URL=true` turns that into an error so a misconfigured environment cannot publish a sitemap and canonical links pointing at the wrong origin. The deploy workflow sets it; local builds do not need it.

## Custom domain

`static/CNAME` contains `docs.vegangrove.org` and is copied into `build/` on every build, which is how Pages learns the domain. On the DNS side, a `CNAME` record for `docs` points at the GitHub Pages hostname for the account.

One-time, after the first successful deploy:

1. Repository Settings, Pages, Source: **GitHub Actions**.
2. Confirm the custom domain shows as verified (DNS check passes).
3. Tick **Enforce HTTPS**. The box is disabled until GitHub has issued the certificate, which follows DNS verification by a few minutes. Come back and tick it; this is the step The Trick Book's docs skipped.

## Local

```bash
npm run start       # dev server with hot reload, no Mermaid prerender
npm run validate    # exactly what CI runs
npm run serve       # serve build/ to check the production output
```

`onBrokenLinks: 'throw'` and the required `description` field mean a broken link or missing frontmatter fails `validate` locally before it fails CI. See [testing](/engineering/testing).

## Rollback

Pages serves the last successful deploy. A bad page is fixed forward with a PR; a broken build never replaces the live site because the `deploy` job only runs after `build` succeeds.
