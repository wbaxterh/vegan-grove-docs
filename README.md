# Vegan Grove Docs

Technical documentation for the Vegan Grove platform, published at [docs.vegangrove.org](https://docs.vegangrove.org). Built with [PokeDocs](https://github.com/wbaxterh/pokedocs), a Docusaurus preset with build-time Mermaid, one-block branding, and an agent surface (`/llms.txt` plus a Markdown twin of every page).

The docs are public on purpose. See the [disclosure policy](https://docs.vegangrove.org/privacy/disclosure-policy) for what they never contain.

## Run

```bash
nvm use                          # Node 24
npm ci
npx playwright install chromium  # once, renders Mermaid at build time
npm run start                    # http://localhost:3000
```

## Validate

```bash
npm run validate   # biome, tsc, pokedocs check, docusaurus build
```

`validate` is the CI contract. A broken link, a bad Mermaid block, or a page without a `description` fails the build.

## Layout

```
docs/            all pages; sidebars.ts is the explicit information architecture
src/css/         site personality only, the theme is compiled from docusaurus.config.ts
static/          logo, favicon, CNAME, robots.txt
.github/         ci.yml (validate + gitleaks), deploy.yml (GitHub Pages)
```

## Conventions

- Every page has `title` and a one-sentence `description` in frontmatter, and a `Status: **...**` line under the H1.
- Links are absolute site paths (`/privacy/data-inventory`).
- ADRs live in `docs/architecture/adrs/adr-NNNN-title.md`.
- No em dashes. No infrastructure identifiers. No member data.

## Related repositories

- [vegan-grove-api](https://github.com/wbaxterh/vegan-grove-api)
- [vegan-grove-web](https://github.com/wbaxterh/vegan-grove-web)
- [vegan-grove-mobile](https://github.com/wbaxterh/vegan-grove-mobile)

## License

Proprietary. See `LICENSE`: read, study, and contribute; do not redistribute.
