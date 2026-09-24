---
title: Threat model
description: Who might want activists' data, how they would try to get it, and which controls stop each attempt.
sidebar_position: 3
---

# Threat model

Status: **Proposed 2026-09-24**

A threat model for a small app does not need to be exotic. It needs to be honest about who the adversaries are and which one control stops each of them. This page is reviewed whenever a feature changes visibility, storage, or a third party.

## Adversaries

| Adversary | Wants | Capability |
|---|---|---|
| A1 Curious member | To see who else is in the app, who went to an action, who is friends with whom | Normal account, scripts against the API |
| A2 Hostile outsider | A list of activists, or one person's movements | Public web, scraping, credential stuffing, social engineering |
| A3 Business or org | To contact reviewers or members directly | A claimed Place or Organization account |
| A4 Compromised device | Everything the member could see | The member's phone or browser session |
| A5 Database or backup leak | Everything at rest | A stolen dump or a misconfigured backup |
| A6 Third party | Behavioral data | Whatever we send them |
| A7 Ourselves | Convenience over principle | Admin tools, logs, analytics |

## Attacks and controls

| Attack | Adversary | Control |
|---|---|---|
| Enumerate users through `GET /users/:id`, search, or a public profile page | A1, A2 | No such endpoints exist. Handles resolve only inside a friendship or on a public post. Discoverability is off by default. [ADR-0004](/architecture/adrs/adr-0004-profiles-never-public) |
| Read attendee lists for any event | A1 | Attendees endpoint requires organizer role on that event, checked in the DB per request |
| Confirm an email has an account | A2 | Magic link always returns 202; registration errors do not distinguish "exists" from other failures beyond rate limits; login errors are uniform |
| Credential stuffing | A2 | argon2id, rate limits on auth routes, SSO and magic link offered so passwords are optional, sessions revocable per device |
| Take over an account through SSO by supplying a victim's email | A2 | Email is taken only from the verified identity token, never from the request body. This is the exact bug found in The Trick Book's Apple sign-in. |
| Recover a member's location from a photo | A2 | EXIF stripped on device before upload; video is transcoded by Bunny, originals are not served |
| Recover a member's location from server logs | A2, A7 | The client sends a bounding box, never a point; pino redacts and never logs bodies or query strings on map routes |
| Scrape the public feed to build a who-is-vegan list | A2 | Public posting is off by default and per post; a public post exposes a handle and avatar only; no handle-to-profile page |
| Contact members from a claimed business | A3 | No messaging path from Places or Organizations to members; reviews show a handle only when the author opts in |
| Read messages from a stolen session | A4 | Sessions are revocable from settings; 90-day message retention limits the window; end-to-end encryption planned |
| Read messages from a database dump | A5 | Ciphertext at rest with the key outside the database ([ADR-0011](/architecture/adrs/adr-0011-messages-encryption)); emails and handles are the remaining exposure, which is why nothing else identifying is stored |
| Reconstruct behavior from analytics | A6, A7 | There is no third-party analytics and no client event stream ([ADR-0007](/architecture/adrs/adr-0007-no-third-party-analytics)) |
| Leak through the companion | A6 | Prompts carry handle and interests only; unpinned conversations expire in 24 hours ([ADR-0012](/architecture/adrs/adr-0012-companion)) |
| Leak through the docs | A2 | [Disclosure policy](/privacy/disclosure-policy): no hosts, IPs, ports, keys, or member data in public docs |
| Leak through git history | A2 | Public repos with GitHub push protection, secretlint on every commit, gitleaks in CI ([ADR-0009](/architecture/adrs/adr-0009-public-repos)) |
| Convenience creep: an admin export, a debug endpoint, a "list all users" page | A7 | The principles checklist forbids admin tools that list members beyond the handle; every admin route is in the API surface doc and reviewed |

## Residual risks

- A member who posts publicly and uses the same handle elsewhere is linkable. The app warns once when public posting is enabled.
- An organizer sees the handles of attendees. Organizers are trusted by construction; the control is that only that event's organizer sees them.
- Email is stored in plaintext because it must be usable for delivery. A dump exposes it. Members who want to minimize this can sign up with a forwarding address; the app does not care what the address is.
- End-to-end message encryption is not in v1. Until it is, the operator can technically read messages with the key. The retention window and the public code are the interim controls.
