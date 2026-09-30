---
title: Media
description: The film library, built to parity with The Trick Book's Couch and extended for documentaries, with the parity table, the home rows, the item page, the watchlist and reactions, and the automation that keeps it fresh.
sidebar_position: 7
---

# Media

Status: **Built 2026-09-30** (API and seed shipped; web and mobile screens in the same change set; posters wait on the media CDN)

The Trick Book has The Couch, a Netflix-style library of action-sports films: a rotating hero, shelves, portrait cards, a detail page with credits and comments, and an admin that imports films from batch files. Vegan Grove's Media section is the same grammar for the cause, and then more: every title ends in an action, carries a content warning when it needs one, lists every place to watch it with a free-first rule, and never records who watched what.

## Parity with The Couch

The table is the standard this feature is held to. "Couch" is what The Trick Book ships today (surveyed 2026-09-30 across its backend, web and mobile repos); "Vegan Grove" is what this repo set ships; "Extension" is what the cause needed on top.

| Feature | The Couch | Vegan Grove | Extension |
|---|---|---|---|
| Catalogue record | one document per film with slug, type, tags, year, producer, directors, riders, duration, poster and backdrop, watch options with an access level, provenance, rights, SEO | same shape as `media_items` with kind, tags as topics, directors and featuring, runtime, poster and backdrop, watch links with access, provenance, external ids | content warnings, an action list, an official site, TMDB rating |
| Stable public URL | slug or id, both resolved | slug only | none needed |
| Watch providers | array stored, only the first free one shown on web, ignored on mobile | every provider rendered on both clients with an access badge, JustWatch attribution when providers came from TMDB | curated official free stream stays first; providers never overwrite it |
| Rights | "external only" plus a notice that the film is not rehosted | never hosted, same notice on every item page | none |
| Hosted streaming | Bunny HLS with signed URLs for owned edits | not built; the library is links and trailers | Vegan Grove may host its own recordings later through the feed's video pipeline |
| Trailer | YouTube iframe loaded on page view | click to load through `youtube-nocookie.com`, nothing fetched before the click | none |
| Posters | hot-linked YouTube frames | poster and backdrop from TMDB, re-hosted on the media CDN; a generated poster when there is none | none |
| Hero | rotates every 8 seconds through featured plus recent items with an image | featured items in a deterministic daily order from `/api/media/home`, identical on web and mobile, 8 second rotation, paused on hover and under reduced motion | none |
| Shelves | one collection per film, ten per row, built with one query per row | many-to-many collections with an editor-set order, plus automatic rows (new, free, under 30 minutes, one per topic) in one call | topic rows come from the vocabulary in the seed |
| Browse and sort | sport pills and six sorts in the URL | kind pills, search, and five sorts in the URL (`featured`, `release`, `title`, `rating`, `runtime`), cursor pagination | free-only and runtime filters |
| Search | unindexed regex over five fields | indexed filters plus a regex over title, tagline, synopsis, directors, featuring, tags and genres (the library is small) | none yet |
| Detail page | player, kicker, title, description, love and respect, share, credits card, rider links, comments, JSON-LD Movie and VideoObject | backdrop header, poster, kicker, tagline, save, two reactions, share, synopsis, providers, trailer, credits, warnings, actions, related shelf, JSON-LD Movie with duration and BreadcrumbList | "This moved me" and "I took action" instead of love and respect |
| Related | none on the client | shared topics and genres, most shared first | none |
| Reactions | love and respect, no unique index | moved and acted, one row per member and type, counts public, authors private | none |
| Comments | flat list with a listing bug | not in this milestone | see below |
| Watchlist | none | private saved list per member, on web at `/app/watchlist` and on mobile | never a history |
| View counts | incremented on every metadata read including crawlers | none, by design | none |
| Admin | Next.js pages with a YouTube prefill and a direct upload | admin API for titles and shelves; every hand-set field is locked against ingest | admin pages are the next milestone |
| Import | batch JSON in the web repo, applied over SSH | the seed file in the API repo plus Wikidata discovery and TMDB enrichment, run by the [data refresh](/ingest/automations) | the seed carries the editorial layer |
| SEO | canonical, Open Graph video.movie, sitemap of one sport | canonical, Open Graph video.movie, sitemap and llms.txt of every published title and shelf | none |
| Mobile | a media tab: hero, shelves, explore grid, detail with a WebView player | reached from Home's Learn step: hero, shelves, explore grid with search and chips, detail with providers, trailer, save and reactions | none |

The survey that produced this table lives with the project notes; the short version is that the Couch's strongest idea is its rights-aware catalogue record and its weakest is that nothing on it is private, and Vegan Grove keeps the first and fixes the second.

## What ships

- A library home with a hero, editor shelves and automatic rows, then a browse grid with search, kind pills, sort and load more.
- An item page with everything a member needs to decide, watch, and act.
- Seven editor shelves seeded from `media-collections.json`: Start here, Investigations, Health and food, The planet, Oceans and wildlife, Ethics and philosophy, Activism.
- Twenty-four curated titles, Christspiracy among them, each with topic tags, a content warning where it applies, an official site, a free official stream where the maker publishes one, and one action link.
- A private watchlist and two reactions.
- An admin API for titles and shelves.

## Privacy choices in the details

- Films are not hosted. `watchLinks` point out to the platform; no playback happens inside the app.
- Trailers are YouTube embeds that load only after a click, through `youtube-nocookie.com`, so simply visiting the page sends nothing to Google. The click is the consent.
- No "watched" tracking and no view counts. The watchlist is a saved list, not a history.
- Reaction and save counts are public on a title; who saved or reacted is answered only to that member, and those reads are never cached.
- Posters and backdrops are re-hosted on the app's own CDN. Nothing is hot-linked from TMDB or YouTube.

## Data and visibility

`media_items` and `media_collections` are public. `saved_media` and `media_reactions` are private to the member and appear in the [data inventory](/privacy/data-inventory). See the [data model](/architecture/data-model).

## API

Public: `GET /api/media/home`, `GET /api/media?q=&kind=&tag=&year=&free=&maxRuntime=&sort=&cursor=`, `GET /api/media/collections`, `GET /api/media/collections/:slug`, `GET /api/media/:slug` (adds `viewer` with a session), `GET /api/media/:slug/related`. Member: `POST` and `DELETE /api/media/:id/save`, `GET /api/me/watchlist`, `POST /api/media/:id/reactions`, `DELETE /api/media/:id/reactions/:type`. Admin: `/api/admin/media` and `/api/admin/media/collections`. Public reads carry `Cache-Control: public, max-age=300, stale-while-revalidate=3600`; anything with a viewer is `private, no-store`.

## Screens

Web: `/media`, `/media/[slug]`, `/media/collections/[slug]`, `/app/watchlist`. Mobile: a stack under `/media` reached from Home's Learn step (home, explore, item, collection); not a tab.

## Curation

Titles enter through the seed file or the admin API, are enriched from TMDB, and land `draft` unless the source is trusted. Admins rewrite the synopsis in the app's own words, check the watch links, set warnings and actions, place the title on a shelf, and publish. Items whose links all break are unpublished rather than left broken. The [automation](/ingest/automations) refreshes providers and posters on a schedule and never publishes anything.

## Next milestone

- Comments on titles, with a moderation queue (graphic-content threads attract abuse).
- "Suggest a film": a form that creates a draft, admin publishes.
- A screening kit per title (synopsis, discussion questions, runtime, licence status, how to obtain a public-performance licence, follow-up actions) and a "host a screening" form that creates an event of type `screening`.
- Admin pages on the web for what the admin API already allows.
