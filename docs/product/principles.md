---
title: Principles
description: The product principles checklist every change is measured against, with privacy first.
sidebar_position: 2
---

# Principles

Status: **Proposed 2026-09-24**

Every pull request in every repo carries the checklist from `PRODUCT-PRINCIPLES-CHECKLIST.md`. This page explains the reasoning behind each section so the checklist is understood, not just ticked.

## 1. Privacy and data minimization, always first

The Trick Book's checklist starts with rider value. Vegan Grove's starts with privacy, because the members are activists and the worst failure mode of this product is a list of them leaking. A feature that adds a field, widens a visibility rule, or sends anything personal to a third party has to justify itself in the [data inventory](/privacy/data-inventory) before it merges.

Concrete tests: no new personal data without an inventory entry, no profile or list becomes more visible than before, nothing personal reaches logs or third parties, media strips EXIF, deletion still removes everything, and no doc or code names infrastructure.

## 2. Activist value

Name the real-world action the change helps a member take. If you cannot, the change is probably a dashboard.

## 3. Trust and correctness

The principal comes from the session, never from a request body. Every list is filtered by visibility on the server before it leaves the API. Input is validated with zod at the route boundary. Tests cover the permission boundary, not just the happy path. Most of The Trick Book's security findings were violations of the first two sentences; they are cheap to enforce from day one and expensive to retrofit.

## 4. Simplicity and hierarchy

Every screen answers three questions in order: what is this (Context), what can I do (Action), what helps me do it (Support). One way to do each thing. Raw backend fields are never the primary UI.

## 5. Data UX rules

Places show vegan level and type before anything else. Events show when, where (as much as the organizer allows), and who hosts. Counts are shown; identities are not, unless the viewer is allowed to see them.

## 6. Companion

Ivy's prompts carry the handle and stated interests, nothing else. Unpinned conversations expire. Tools read public data only. The model id is configuration. See [ADR-0012](/architecture/adrs/adr-0012-companion).

## 7. Feedback loop

One aggregate signal per change, and a rollback plan. The weekly review uses the Adoption, Clarity, Impact rubric: if two of three fail after one iteration, simplify or sunset.

## 8. Aesthetic consistency

Shared tokens only (`--vg-*`), dark mode first, light mode correct, no third-party fonts or icon CDNs. The tokens are listed in the [tech stack](/architecture/tech-stack).

## The PR summary block

```
Activist outcome:
What changed:
Privacy and trust checks done:
Signal to watch:
Rollback plan:
```

This is the same shape as The Trick Book's "rider outcome, trust checks, feedback signal" triple, with privacy pulled into the trust line so it is never optional.
