---
title: Guides
description: Editorial how-to content for activists, from outreach scripts and know-your-rights to vegan 101 and sanctuary volunteering.
sidebar_position: 8
---

# Guides

Status: **Proposed 2026-09-24**

Guides are The Trick Book's Trickipedia for activism: the encyclopedia of how. A Guide is a public, admin-authored page with a category and a slug, written for someone about to do the thing for the first time.

## Categories

| Category | Examples |
|---|---|
| `outreach` | Cube of Truth basics, conversation scripts, handling hostility, leafleting that works |
| `rights` | Know your rights at a protest, filming police, what to carry, a buddy system |
| `vegan101` | First week, reading labels, eating out in SoCal, nutrition basics with sources |
| `sanctuary` | Volunteering etiquette, what to bring, how to visit without stressing animals |
| `nutrition` | B12, protein, athletes, kids, with citations |
| `other` | Lobbying, letter campaigns, local government meetings |

## What ships in v1

- Guide pages rendered from markdown stored in the database, with headings, images, links, and a "last reviewed" date.
- Category index pages.
- Links from Events (a `protest` event links the rights guides), from Places (a sanctuary links the sanctuary guides), and from Ivy, which cites Guides in its answers.
- Full-text search across Guides only (public content), on the web.

## Data and visibility

`guides` (public when `status: 'published'`). Guides carry no member data. Authors are not shown by default; a guide may credit an organization.

## API

`GET /api/guides?category=`, `GET /api/guides/:slug`, admin CRUD under `/api/admin/guides`.

## Screens

Web: `/guides`, `/guides/[slug]`. Mobile: reached from Home and from Events and Places; not a tab.

## Editorial rules

- Legal content (`rights`) states the jurisdiction (California) and the review date, links to primary sources, and says plainly that it is not legal advice.
- Nutrition content cites sources.
- Outreach content is written by people who do outreach, reviewed by an organizer.
- No affiliate links.

## Open questions

- Community-contributed guides. Proposal: draft submissions from organizers, admin publishes; not in v1.
- Offline access on mobile for the rights guides. Proposal: cache the `rights` category on first open; M3.
