---
title: Releases
description: The release page convention, one page per version across all four repos, and the current unreleased scaffold entry.
sidebar_position: 1
---

# Releases

Status: **Scaffolded 2026-09-24**

One page per release, across all four repos, in this directory as `releases/vX.Y.Z.md`. A release is a coordinated set: the API commit that is live, the web commit Amplify built, the mobile build in the stores, and the docs that describe them. The version number is shared; a repo that did not change in a release says so.

## Page convention

Each `releases/vX.Y.Z.md` has four sections, in this order:

1. **Summary.** Two or three sentences a member could read: what they can do now that they could not before.
2. **Changes by repo.** A subsection per repo (`api`, `web`, `mobile`, `docs`) listing the squash-merge subjects that landed, with the deployed SHA for the API and web and the build numbers for mobile. A repo with no changes gets the line "no changes".
3. **Privacy notes.** Any new field in the [data inventory](/privacy/data-inventory), any change to a default visibility, any change to retention or deletion, and any new third-party origin in the CSP. "None" is a valid entry and must be written explicitly.
4. **Known issues.** What is wrong that shipped anyway, and the plan. This is also where a security fix is announced after it ships, per the [disclosure policy](/privacy/disclosure-policy); there is no standing table of open vulnerabilities anywhere on this site.

The page is drafted on the release branch before the store build is started ([build and release](/mobile/build-and-release)) and merged with the docs deploy after everything is live. Versions follow semver at the product level: a change to the API that breaks the oldest supported mobile build is a major.

## Releases

### 0.1.0 (unreleased): scaffold

The four repos exist locally with their initial commits and pass `npm run validate`. Nothing is deployed and nothing is pushed.

- `vegan-grove-api`: Express 5, Mongoose 9, the full data model, auth and places working end to end with tests, every other route mounted as a `501` stub, the companion service and SSE route, PM2 ecosystem file.
- `vegan-grove-web`: Next 15 App Router with every public route and the `/app` area as stubs, the session route handler and middleware, security headers and CSP, `robots.txt`, `sitemap.xml`, `llms.txt`, `amplify.yml`, one Playwright smoke test.
- `vegan-grove-mobile`: Expo SDK 57 with the `(auth)` and `(tabs)` groups, the profile stack, the companion modal, the API client and endpoints registry, the auth store and `AuthGate`, the places map, EAS profiles, and the release guard.
- `vegan-grove-docs`: this site, with the product, privacy, architecture, ADR, feature, engineering, deployment, and roadmap sections, CI workflow and an Amplify build spec.

Privacy notes: the data inventory, threat model, and disclosure policy are published with this release. No member data exists.

Known issues: no GitHub repos, no Atlas project, no AWS resources, no EAS project yet. See [milestones](/roadmap/milestones).
