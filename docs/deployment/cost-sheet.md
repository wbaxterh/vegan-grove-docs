---
title: Cost sheet
description: The expected monthly cost of running Vegan Grove at MVP traffic, what drives each line, and the free tiers it relies on.
sidebar_position: 6
---

# Cost sheet

Status: **Proposed 2026-09-24**

The platform is sized to cost about the price of a lunch per month. Every line below is on-demand or free tier; nothing is reserved or committed, so the whole thing can be turned off in an afternoon.

## Monthly

| Item | Monthly | What drives it, when it grows |
|---|---|---|
| EC2 `t4g.micro`, on-demand, `us-east-1` | ~$6.13 | flat per hour; grows only if the instance size changes, which the API's design (no media bytes, no heavy compute) defers a long way |
| Public IPv4 address | ~$3.65 | flat, charged since 2024 for every public address; the Elastic IP the Atlas allowlist depends on |
| EBS 8 GB gp3 | ~$0.64 | flat; the host holds code, logs, and three release directories, not media |
| Route 53 hosted zone | $0.50 | flat per zone; queries at MVP volume are cents |
| S3 media bucket + CloudFront | under $1 | storage and egress; grows with images posted, slowly, because EXIF-stripped re-encodes are small |
| SES magic-link email | $0.10 per 1,000 | one email per magic-link login; sandbox mode until production access is granted |
| Amplify Hosting, WEB_COMPUTE | $1 to $3 | build minutes plus SSR request-seconds and egress; grows with page views and with previews if enabled |
| MongoDB Atlas M0 | $0 | free tier, see below |
| EAS Build | $0 | free tier, see below |
| GitHub Pages, GitHub Actions | $0 | public repo |
| **Total** | **about $12 to $15** | |

Annual, outside the table: the domain (about $12 a year). The Apple Developer membership ($99 a year) and the Google Play registration ($25 once) are already paid through the maintainer's existing accounts.

## Not in the table

Two usage-based services start near zero and are the first lines to watch:

- **Bunny Stream** (video): storage and delivery per gigabyte, with a small monthly minimum once there is any usage. Grows with video posts. Zero until the first upload.
- **Anthropic API** (the companion, [Ivy](/features/companion)): per token, model set by `COMPANION_MODEL`. Rate-limited per session at the API so a single member cannot run the bill. Zero until the companion is switched on.

## Free tiers relied on

| Tier | Limit that matters | When it stops being enough |
|---|---|---|
| Atlas M0 | 512 MB storage, shared CPU, no backups, 500 connections | the data model is text and ObjectIds, so hundreds of thousands of documents fit; backups are the real gap, and the upgrade to M2 or M10 is a click |
| EAS Build | 30 builds a month, lower-priority queue | a release week with both platforms and a few previews uses maybe 10 |
| GitHub Pages | 1 GB site, 100 GB bandwidth a month soft limit | a docs site is megabytes |
| GitHub Actions | 2,000 minutes a month for public repos is unlimited | n/a |
| OpenFreeMap tiles | no key, no quota, fair use | if the project ever ends or changes terms, the map style is open and self-hosting tiles is the fallback, recorded in the [maps ADR](/architecture/adrs/adr-0006-maps) |

## Reading the bill

One AWS account, one billing alarm at $25. Only Amplify and S3 egress can move; everything else is flat. A jump without traffic behind it is usually an Amplify preview branch left enabled.
