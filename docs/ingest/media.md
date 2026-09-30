---
title: Ingest media
description: How the media library is seeded from Wikidata and enriched from TMDB, with the SPARQL query, the poster and watch-provider rules, and the monthly cadence.
sidebar_position: 5
---

# Ingest media

Status: **Proposed 2026-09-29**

The media library is seeded, not scraped. `ingest:media:wikidata` finds films about the cause and `ingest:media:tmdb` enriches them. Both POST to `POST /api/ingest/media` under the [contract](/ingest). Items land `draft`; an admin reads the synopsis, checks the watch links, and publishes. Nothing here hosts a film.

## Wikidata

Wikidata is CC0. The query finds films and documentaries whose main subject (P921) is veganism, animal rights, intensive animal farming, or animal welfare.

```sparql
SELECT DISTINCT ?film ?filmLabel ?year ?tmdb ?imdb WHERE {
  VALUES ?subject { wd:Q181138 wd:Q426 wd:Q912362 wd:Q459426 }
  ?film wdt:P921 ?subject .
  ?film wdt:P31/wdt:P279* wd:Q11424 .
  OPTIONAL { ?film wdt:P577 ?date . BIND(YEAR(?date) AS ?year) }
  OPTIONAL { ?film wdt:P4947 ?tmdb }
  OPTIONAL { ?film wdt:P345 ?imdb }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY DESC(?year)
```

`Q181138` is veganism, `Q426` animal rights, `Q912362` intensive animal farming, `Q459426` animal welfare. `Q11424` is film; documentary film (`Q93204`) is a subclass, so the `P31/P279*` path covers both. Send with `Accept: application/sparql-results+json` and a descriptive `User-Agent`; the query service throttles anonymous generic clients.

| Media item | From |
|---|---|
| `sourceId` | the Q-id, `Q1234567` |
| `title` | `filmLabel` |
| `kind` | `documentary` when P31 includes `Q93204`, else `film` |
| `year` | `year` |
| `externalIds` | `{ wikidata, tmdb, imdb }` |
| `tags` | `environment` for intensive animal farming, `ethics` for the other three; admins adjust |
| `sourceUrl` | `https://www.wikidata.org/wiki/` followed by the Q-id |

`source` is `wikidata`. Talks, shorts, and series are curated by hand; Wikidata coverage of those is thin.

## TMDB enrichment

`ingest:media:tmdb` runs after the Wikidata step over items that have `externalIds.tmdb`, and needs `TMDB_API_KEY`. It re-sends each row under its existing key (`source: wikidata`, the same `sourceId`) with the fields below added, so the upsert updates the row instead of creating a second one. `source: tmdb` is used only for a title added by hand-picked TMDB id that Wikidata does not know.

| Field | From TMDB | Rule |
|---|---|---|
| `synopsis` | `overview` | a draft only; admins rewrite it in the app's own words before publishing |
| `posterKey` | `poster_path` | the script downloads, re-encodes, and uploads to the media bucket under `media/posters/` plus the `sourceId`, then sends only the key. The API never fetches a remote image. |
| `watchLinks` | watch providers for region `US`: `flatrate`, `free`, `rent`, `buy` | `{ provider, url }` where `url` is the title's watch page from the same response, since providers expose no deep links |
| `backdropKey` | `backdrop_path` | same rule as the poster, under `media/backdrops/` |
| `trailerYoutubeId` | videos of type `Trailer` on YouTube, official first, then any trailer, then a teaser | the client embeds through `youtube-nocookie.com` and loads on click only |
| `year`, `releaseDate` | `release_date` | year only when Wikidata had none |
| `tagline` | `tagline` | shown under the title on the item page |
| `runtimeMinutes` | `runtime` | rounded |
| `directors` | credits crew with job `Director` | at most ten, deduplicated |
| `featuring` | credits cast in billing order | at most six names; documentaries list the people on screen |
| `genres` | `genres[].name` | at most ten |
| `rating`, `ratingCount` | `vote_average`, `vote_count` | one decimal; omitted when there are no votes |
| `contentRating` | the US certification from `release_dates` | omitted when the US has none |
| `originalLanguage` | `original_language` | ISO 639-1 |

All of these ride on one request per film (`append_to_response=videos,credits,release_dates`), then one more for watch providers. A curated `year`, `synopsis` or `trailerYoutubeId` is never overwritten; the rest is source-owned and refreshes on every run unless an admin edited it.

Watch providers require the line "Watch providers data by JustWatch" wherever `watchLinks` render. The client shows it on the item page; the ingest sets nothing for it.

Poster upload needs the media bucket's write role, which the bot never holds. When the enrichment runs where that role is absent it omits `posterKey` and sends the rest; a later run on the API host fills it in.

## The editorial layer in the seed

`scripts/data/media-seed.json` is the curated catalogue and the editorial layer in one file. Beside the ids, each entry may carry:

| Field | Meaning |
|---|---|
| `tags` | topic tags from the vocabulary `ethics`, `health`, `environment`, `activism`, `investigation`, plus free tags; the automatic home rows are built from the vocabulary |
| `kind` | `documentary` (default), `film`, `series`, `talk` or `short` |
| `contentWarnings` | short phrases such as "graphic footage of animal suffering"; shown on the item page, never hidden behind a click |
| `officialSite` | the film's own site |
| `watchLinks` | only official free streams, with `access: free`; TMDB providers are appended after them, never in front |
| `actions` | one or two `{ label, url, type, org }` links to a well-known organisation: petition, donate, pledge, volunteer, guide, learn |
| `featured` | read by the shelf seed on the host, never sent to the endpoint |

Every script that reads the file goes through one mapper (`toItem` in the seed script), so the Wikidata pass and the seed pass agree on `sourceId` and a title is never inserted twice.

## The data refresh on the host

`seed:media:collections` runs on the API host (it needs the database), after the three ingest steps, as part of the [data refresh](/ingest/bot-runbook). It upserts the shelves in `scripts/data/media-collections.json` by slug, resolves each shelf's titles to the rows the seed created, sets `featured` on the titles the seed flags, and with `--prune-duplicates` removes a second copy of a curated title left by an earlier mapper mismatch, keeping the row the seed owns. A title the library does not have yet is skipped with a log line and picked up on the next run. Bots never run this step.

## What is never done

- No film is hosted or proxied. `watchLinks` leave the app.
- Trailers are YouTube ids only, embedded through `youtube-nocookie.com`, loaded on click.
- No hotlinking of TMDB or Wikimedia images.
- No scraping of streaming sites or JustWatch pages. TMDB's API with a key is the only provider source.

## Cadence

Weekly, as the media job on the [automations page](/ingest/automations). The Wikidata query returns a few dozen rows, and the TMDB step makes two calls per item, well inside TMDB's limits at that size. Admins verify watch links quarterly, per the [media feature page](/features/media).
