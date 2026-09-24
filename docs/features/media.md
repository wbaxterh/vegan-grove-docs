---
title: Media
description: A curated library of vegan documentaries, films, series, and talks with where-to-watch links, trailers that load on click, and no hosted films.
sidebar_position: 7
---

# Media

Status: **Proposed 2026-09-24**

The Trick Book has The Couch, a curated action-sports video library. Vegan Grove's Media section is the same idea for the cause: Dominion, Earthlings, The Game Changers, Cowspiracy, Seaspiracy, talks, shorts, and series, curated by admins, with where to watch. It is the Learn step for a friend who is curious, and the thing a member sends after a potluck conversation.

## What ships in v1

- A library page with filters by kind (documentary, film, series, talk, short) and tags (ethics, health, environment, activism, cooking).
- An item page: poster, title, year, synopsis, tags, where to watch (links to the platforms that carry it, including free official sources), and a trailer.
- Featured items on the library page, set by admins.
- Save to a personal watchlist (private).

## Privacy choices in the details

- Films are not hosted. `watchLinks` point out to the platform; no playback happens inside the app.
- Trailers are YouTube embeds that load only after a click, through `youtube-nocookie.com`, so simply visiting the page sends nothing to Google. The click is the consent.
- No "watched" tracking. The watchlist is a saved list, not a history.
- Posters are images served through the app's own CDN.

## Data and visibility

`media_items` (public), the watchlist is a `saved_media` list on the user (private). See the [data model](/architecture/data-model).

## API

`GET /api/media?kind=&tag=&cursor=`, `GET /api/media/:slug`, `POST`/`DELETE /api/media/:id/save`, admin CRUD under `/api/admin/media`.

## Screens

Web: `/media`, `/media/[slug]`. Mobile: reached from Home (a featured strip) and from Guides; not a tab.

## Curation

Admins add items with a short synopsis in the app's own words (not copied from distributors), verify watch links quarterly, and prefer official free sources when a filmmaker offers one. Items whose links all break are unpublished rather than left broken.

## Open questions

- Community suggestions for the library. Proposal: a "suggest a film" form that creates a draft item, admin publishes.
- Screenings as events: a Media item can be referenced by an Event of type `screening`. Proposal: yes, in M2 alongside Events.
