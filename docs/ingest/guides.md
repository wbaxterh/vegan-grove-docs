---
title: Ingest guides
description: Guides are drafted from cited sources, never scraped; the drafting brief for a bot, the JSON draft shape, and how a draft becomes a published guide.
sidebar_position: 6
---

# Ingest guides

Status: **Proposed 2026-09-29**

A guide is written, not collected. `ingest:guides` accepts a JSON file of drafts, written by a person or by a bot from cited sources, and POSTs them to `POST /api/ingest/guides` under the [contract](/ingest). Every draft lands `status: draft`. An admin edits and publishes through the admin guide routes. The bot never publishes.

## Drafting brief

This is the brief a bot follows to produce a draft. A draft that ignores it gets rejected by the admin, which wastes both sides' time.

**Topics by category.** One guide per topic. Check `GET /api/guides?category=` first so a topic is not drafted twice.

| Category | Topics |
|---|---|
| `outreach` | Cube of Truth basics, conversation scripts that stay kind, handling hostility, leafleting that works, tabling at a farmers market |
| `rights` | Know your rights at a protest in California, filming police in California, what to carry to an action, a buddy system |
| `vegan101` | Your first week, reading labels, eating out in Southern California, nutrition basics |
| `sanctuary` | Volunteering etiquette, what to bring, visiting without stressing the animals, a tour day with kids |
| `nutrition` | B12, protein, athletes, kids, pregnancy, each with citations |
| `other` | Speaking at a city council meeting, a letter campaign, contacting a representative |

**Sources.** Every claim of fact carries an entry in `sources[]` with a license the app may cite: government and court sites, peer-reviewed papers, established nonprofits' own pages (civil liberties groups, sanctuaries, the Vegan Society, dietetic associations). Not acceptable: forums, social media posts, content farms, other apps' guides, or anything behind a paywall the reader cannot reach. Copy nothing longer than a short quotation; write the guide in the app's words.

**Length and structure.** 600 to 1,200 words of Markdown. `##` headings only. A short opening paragraph that says who the guide is for, then steps or sections, then "Sources" as the last heading listing the same entries as `sources[]`. No images in a draft; admins add them. No links to Facebook, Instagram, or affiliate pages.

**Tone.** From `SOUL.md`: the sharpest, kindest organizer you know. Direct sentences. Practical over technical. No marketing tone, no exclamation marks, no guilt. Written for someone about to do the thing for the first time. No em dashes.

**Rights guides.** State the jurisdiction as California in the first paragraph, say plainly that the guide is not legal advice, cite the primary source for each right (statute, court decision, or a civil liberties organization's page), and include a "last reviewed" date in the body.

**Nutrition guides.** Cite a dietetic association position or a peer-reviewed review for every nutrient claim.

## Draft shape

```json
{
  "source": "bot:grokbot",
  "items": [
    {
      "sourceId": "rights-filming-police-california",
      "title": "Filming police at a protest in California",
      "category": "rights",
      "summary": "What the law allows when you record officers at an action, and how to keep the footage.",
      "body": "## Who this is for\n\n...\n\n## Sources\n\n1. ...",
      "sources": [
        { "title": "California Penal Code section 148(g)", "url": "https://leginfo.legislature.ca.gov/", "license": "public domain" },
        { "title": "ACLU: protesters' rights", "url": "https://www.aclu.org/know-your-rights/protesters-rights", "license": "cited, not reproduced" }
      ]
    }
  ]
}
```

`sourceId` is the category and the topic slug joined, and is what makes a re-run update the same draft instead of adding a second. `source` is `bot:grokbot` for a bot's drafts and `curated` for a person's.

## Draft to published

| State | Who | How |
|---|---|---|
| `draft` | ingest | every ingested guide, always |
| edited | admin | the admin guide routes record each edited field in `adminEdited`, so a re-ingest cannot undo it |
| `published` | admin | after checking every source link and, for `rights`, the jurisdiction note |

A re-ingest of a published guide never moves it back to draft and updates only fields the admin has not edited. In practice a published guide is frozen against the bot, and changes go through the admin.

## Cadence

As needed. A run is triggered by a topic gap (a category with fewer than three published guides) or by a review date passing on a `rights` guide. The bot drafts at most five guides per run, so an admin can review them in one sitting.
