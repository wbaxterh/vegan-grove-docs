---
title: "ADR-0013: Media pipeline"
description: Images upload directly to S3 with presigned URLs and serve through CloudFront; video uploads to Bunny Stream with short-lived credentials and plays as HLS.
---

# ADR-0013: Images through S3, video through Bunny Stream, bytes never through the API

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-24 |
| **Deciders** | Wes Huber |
| **Related** | [ADR-0005](/architecture/adrs/adr-0005-data-minimization), [ADR-0010](/architecture/adrs/adr-0010-account-deletion) |

## Context

Wes wants a feed with photos and video and a media library. Video needs transcoding and adaptive playback, which is expensive to build and cheap to buy. The Trick Book's split (images to S3 through presigned PUTs, video to Bunny Stream through TUS with an expiring credential, the API never proxying bytes) works well and is the part of its media code worth keeping. Its images are served straight from a public bucket without a CDN, and its Bunny playback URLs are unsigned by default.

## Decision

- **Images:** the client asks `POST /api/uploads/image/presign` for a 5-minute presigned PUT to a private S3 bucket under a key the API chooses (`posts/<uuid>.jpg`, `avatars/<uuid>.jpg`, `places/<uuid>.jpg`). Reads go through CloudFront with the bucket as an origin access control origin; the bucket itself is not public. EXIF is stripped on the device before the PUT ([ADR-0005](/architecture/adrs/adr-0005-data-minimization)).
- **Video:** the client asks `POST /api/uploads/video/create`, the API creates the video in the Bunny library and returns a TUS endpoint plus a one-hour signed credential, the client uploads directly, and a status poll flips the post from `processing` to `published`. Playback is HLS from the Bunny CDN. Posts with `friends` or `grove` visibility use token-authenticated playback URLs minted per request with a short expiry; `public` posts may use plain URLs.
- **Deletion:** removing a post or an account queues S3 and Bunny deletions through a worker with retries.
- **Media library** (documentaries, films): posters are images as above; the films themselves are not hosted. `watchLinks` point to where to watch, and trailers embed through `youtube-nocookie.com` only after a click.

## Alternatives considered

- **Everything on AWS (S3 plus MediaConvert plus CloudFront for HLS).** Keeps one vendor but MediaConvert pricing and the packaging pipeline are far more than a one-person project should carry. Rejected.
- **Mux or Cloudflare Stream.** Comparable to Bunny with higher minimums. Bunny is the known quantity from The Trick Book.
- **Proxy uploads through the API.** Simpler to reason about, but the API host is a t4g.micro. Rejected.

## Consequences

### Positive

- The API handles metadata only; the small instance stays small.
- Adaptive video with no transcoding code to maintain.
- Private posts get private playback.

### Negative

- Two media vendors, two deletion paths. The worker owns both.
- Bunny is a third party that receives video content. It is listed in the [data inventory](/privacy/data-inventory) and the content is already metadata-free when it arrives.
