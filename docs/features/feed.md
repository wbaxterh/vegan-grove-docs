---
title: Feed
description: Photos and video shared with friends, a Grove, or the public, with friends as the default and a public-posts view instead of a profile.
sidebar_position: 5
---

# Feed

Status: **Proposed 2026-09-24**

Wes asked for a feed that works like a normal social app: photos and video, love reactions, comments, saves. The product principle says profiles are never public. This page is the reconciliation, and it is the most carefully scoped feature in v1.

## The rule

- Every post has a `visibility`: `friends` (default), `grove` (members of one Grove), or `public`.
- `public` is available only after a member turns on `publicPostsEnabled` in settings, which shows a one-time warning that public posts are linkable to the handle.
- A public post shows the handle and avatar. Tapping the handle opens a **public-posts view**: that handle's public posts and nothing else. No bio, no area, no friends, no Groves, no counts, no join date. The API route `GET /api/handles/:handle/posts` returns 404 when a handle has no public posts, so it cannot be used to enumerate handles ([ADR-0004](/architecture/adrs/adr-0004-profiles-never-public)).
- Comments follow the post's visibility. Reactions are counts; reactor identities are visible to the post author only.

## What ships in v1

- Compose: up to ten images or one video, a caption, visibility, optional Grove, Place, or Event tag. Images are re-encoded on the device (EXIF stripped); video uploads to Bunny ([ADR-0013](/architecture/adrs/adr-0013-media-pipeline)).
- Feeds: Friends (default), each Grove you belong to, and Public. The public feed is a discovery surface, not the home screen.
- Love reaction, comments with one level of replies, save, report.
- Post detail with comments. Delete your own post or comment.
- No realtime in v1; the `/feed` socket namespace is reserved. Pull to refresh.

## Data and visibility

`posts`, `comments`, `reactions`, `saved_posts`, `reports`. Feed queries filter by visibility in the database using the caller's friendships and Grove memberships; there is no client-side filtering. See the [data model](/architecture/data-model).

## API

`GET /api/feed?scope=friends|grove:<id>|public`, `POST /api/posts`, `GET`/`DELETE /api/posts/:id`, `POST`/`DELETE /api/posts/:id/reactions`, `GET`/`POST /api/posts/:id/comments`, `POST`/`DELETE /api/posts/:id/save`, `GET /api/handles/:handle/posts`, `POST /api/reports`.

## Screens

Web: `/app/feed` with a scope switcher. Mobile: the Feed tab with the same switcher and the composer.

## What the feed is not

- No algorithmic ranking. Reverse chronological within a scope.
- No follower model, no follow counts, no suggested accounts.
- No resharing to other platforms from inside the app.
- No public feed by default on the home screen. Home shows your friends' and Groves' posts.

## Open questions

- Whether Grove posts should be visible to Grove organizers of other Groves. Proposal: no.
- Whether to allow a "who reacted" list for `friends` posts. Proposal: author only, as above; revisit if members ask.
- Realtime comments (M4 or later, when the socket namespace is wired).
