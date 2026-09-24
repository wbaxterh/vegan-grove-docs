---
title: Data inventory
description: Every personal field Vegan Grove stores, its purpose, who can see it, and how long it lives.
sidebar_position: 2
---

# Data inventory

Status: **Proposed 2026-09-24**

This is the contract behind the [privacy promise](/privacy). Any pull request that adds a personal field must add a row here first. Rows are grouped by the collection that holds them; the full schema is in the [data model](/architecture/data-model).

Visibility values: **self** (the member only), **friends**, **organizer** (of the event in question), **grove** (members of that Grove), **public**, **admin** (moderation only, never exported), **nobody** (stored, never read back except by the system).

## Account

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `email` | Sign-in and magic links | nobody (used to send mail) | Until deletion |
| `passwordHash` (argon2id) | Password sign-in, optional | nobody | Until deletion or password removal |
| `handle` | The only name other members see | friends, grove, organizer, public (only on public posts) | Until deletion |
| `avatarKey` | Optional picture | same as handle | Until deletion or removal |
| `homeArea` | One of eleven SoCal regions, picked from a list | self, and as an aggregate count per Grove | Until deletion |
| `interests` | Chosen tags, used by Ivy and for event suggestions | self, Ivy | Until deletion |
| `providers[]` | Apple or Google subject ids for SSO | nobody | Until deletion |
| `discoverable` | Whether friends can find you by handle (default off) | self | Until deletion |
| `publicPostsEnabled` | Whether you can post publicly (default off) | self | Until deletion |
| `role` | member or admin | nobody | Until deletion |

Not stored, ever: real name, phone number, birthdate, street address, device GPS, contacts, device identifiers beyond a push token.

## Sessions and sign-in

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `sessions.tokenHash` | SHA-256 of the session token | nobody | 30 days sliding, or on logout |
| `sessions.client` | ios, android, or web, so you can revoke a device | self | With the session |
| `magic_links.tokenHash` | Single-use sign-in link | nobody | 15 minutes |

## Social graph

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `friendships` | Who is friends with whom | the two members involved | Until either deletes the friendship or an account |
| `friend_invites.code` | Invite codes shared in person | self | Expires, default 7 days |
| `grove_members` | Membership and organizer role | self, organizers of that Grove; counts are public | Until leaving or deletion |

## Activity

| Field | Purpose | Visibility | Retention |
|---|---|---|---|
| `event_rsvps` | Going or interested | self, organizer of that event; counts are public | 30 days after the event ends |
| `posts`, `comments`, `reactions`, `saved_posts` | The feed | per post: friends, grove, or public; comments follow the post | Until deletion |
| `place_reviews` | Reviews and check-ins | public text; handle only if `showHandle` | Until deletion |
| `place_lists` | Saved places | self unless `isPublic` | Until deletion |
| `action_log` | Private impact journal | self | Until deletion |
| `messages` (ciphertext) | Direct messages | participants | 90 days by default |
| `companion_conversations` | Ivy chats | self | 24 hours unless pinned |
| `push_tokens` | Device push address | nobody | 30 days after last use |
| `notification_preferences` | What to send | self | Until deletion |

## Server-side records that mention a member

| Record | What it holds | Retention |
|---|---|---|
| Access logs (pino) | Route, status, duration, a hash of the session id. Never email, token, coordinates, or bodies. | 14 days |
| `reports` | Who reported what and why, for moderation | Until resolved plus 90 days |
| Aggregate stats | Counts only, no ids | Indefinite |

## What third parties receive

| Party | What | Why |
|---|---|---|
| AWS SES | Your email address and the sign-in link | To deliver magic links and account mail |
| Apple, Google | Nothing from us. When you use SSO they tell us a subject id and, if you allow, an email. | SSO |
| Bunny Stream | Video files you upload, already stripped of metadata | Transcoding and playback |
| OpenFreeMap | Map tile requests from your device (no key, no cookies) | Map rendering |
| Anthropic | Your handle, your chosen interests, and the text of your Ivy conversation | Running the companion |

No party receives your email for advertising, your location, your friends, or your RSVPs.
