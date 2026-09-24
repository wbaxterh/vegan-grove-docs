# AGENTS.md

All coding agents working in this repository must follow this order:

1. Read `SOUL.md`.
2. Read `PRODUCT-PRINCIPLES-CHECKLIST.md`.
3. Then implement changes.

## Non-negotiables

- Privacy first. No new personal data without an entry in the data inventory. Profiles are never public. Nothing personal reaches logs or third parties.
- The principal comes from the session, never from a request body.
- Every list is filtered by visibility on the server.
- Use the shared design tokens. No new hex colors, no third-party fonts.
- Reliable over flashy. Smaller scope with tests beats larger scope without.
- Never commit secrets, `.env` files, `ios/`, `android/`, or infrastructure identifiers. `secretlint` runs on every commit; treat a finding as a stop.

## Before proposing completion

Run `npm run validate` and provide:

- What activist outcome improved.
- What privacy and trust checks were run.
- What metric or feedback signal should be monitored.

If uncertain, choose the smaller scope and ask for review.

## Commit and PR conventions

- Conventional commit subjects (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- Squash merges into `main`. The `validate` check must be green.
- Copy the PR summary block from `PRODUCT-PRINCIPLES-CHECKLIST.md` into every PR.

## This repository

This is the docs site (PokeDocs on Docusaurus). You are most likely here to write or edit documentation.

```bash
npm ci
npx playwright install chromium   # once, Mermaid renders through chromium at build time
npm run start                     # live dev server
npm run validate                  # biome, tsc, pokedocs check, build; FAILS on broken links, bad mermaid, missing description
```

Layout: `docs/` holds every page and `sidebars.ts` is the explicit information architecture (a new page must be added there or it will not appear). `src/css/custom.css` is site personality only; the color theme is compiled from `branding` in `docusaurus.config.ts`, so never hand-write `--ifm-color-primary`. `static/` holds the logo, favicon, `CNAME`, and `robots.txt`.

Authoring rules:

- Frontmatter has `title` and a one-sentence `description` (required by the build). Under the H1, a line `Status: **Proposed YYYY-MM-DD**` or `**Scaffolded ...**` or `**Audited against code ...**`.
- Links are absolute site paths without extension (`/privacy/data-inventory`). Docs are served from the site root. `trailingSlash` is false, so relative links from an index page resolve one level too high; use absolute paths everywhere.
- Mermaid fences render to SVG at build time. Sequence messages must not contain `;`. Quote node labels that contain parentheses. A diagram must show a mechanism, not decorate.
- ADRs: `docs/architecture/adrs/adr-NNNN-kebab.md` using the format on the ADR index page; add the sidebar entry and the index row in the same PR.
- A feature earns a sidebar category when it has an index (PRD) plus an architecture or spec page.
- No em dashes anywhere. No IP addresses, hostnames of machines, SSH commands, ports, process names, key names, or member data, per the disclosure policy. No marketing tone.
- The agent surface (`/llms.txt`, `/llms-full.txt`, a `.md` twin per page) is generated from the same pages; a good `description` is what makes it useful.
