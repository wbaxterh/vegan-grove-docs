---
title: Milestones
description: The build order from scaffold to first mobile release, with the exit criterion for each milestone.
sidebar_position: 1
---

# Milestones

Status: **Proposed 2026-09-24**

Trust first, then the core loop, then delight, then expansion. Each milestone has one exit criterion that can be checked, not felt.

| Milestone | Scope | Exit criterion |
|---|---|---|
| **M0 Scaffold** (done 2026-09-24, local) | Four repos, governance files, CI contract, docs site, auth and places working in the API | `validate` green in all four repos, docs build with diagrams |
| **M0.5 Provision** | GitHub repos with rulesets and push protection, Atlas project, EC2 instance, Amplify app, EAS project, SES sandbox, domain and DNS, first deploy of each | `GET https://api.vegangrove.org/healthz` returns ok, `vegangrove.org` serves the landing page, `docs.vegangrove.org` serves this site over enforced HTTPS |
| **M1 Places and Guides** | Map on web and mobile, place pages, submit and approve, reviews, OSM seed imported and curated sanctuaries added, first ten Guides, nightly backup job | A new member can find a fully vegan restaurant and a sanctuary within two taps on a dev-client build |
| **M2 Events, Groves, Media, Notifications** | Ten regional Groves, event creation by organizers, RSVP with private attendees, details-after-RSVP, reminders, the media library | Two real organizers run one event each through the app with reminders delivered |
| **M3 Friends, Feed, Messages, Action log** | Invite codes, friends-only feed with photos and video, Grove feed, opt-in public posts, encrypted messages with retention, the action log | A friends-only post with a video plays on both clients, and a database dump contains no readable message |
| **M4 Ivy and polish** | Text companion with read-only tools, dark and light modes reviewed on both clients, accessibility pass, App Store and Play submissions | Ivy answers the three canonical questions with correct Places and Guides, and the iOS build is in TestFlight |
| **M5 Public launch** | Privacy page reviewed, security review of the API, load test, Android internal track to open testing | A stranger reads the privacy page and the code and finds no contradiction |

## Ordering rationale

Places before Events because Places have no member data and exercise the whole stack (map, uploads, moderation) safely. Events before Friends because organizers are the adoption path and events do not need the social graph. Friends, Feed, and Messages together because they share the visibility model and the encryption work. Ivy last because it is the one feature that sends member text to a third party and should land on a stable product.

## What moves a milestone

A milestone slips when its exit criterion fails, not when its feature list is incomplete. Features that miss a milestone move to the next; the criterion does not shrink.

## Not scheduled

End-to-end message encryption, voice or 3D for Ivy, member-created Groves, recurring events, payments of any kind, web push, email reminders. Each waits for evidence from the milestone before it.
