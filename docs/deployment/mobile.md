---
title: Mobile deployment
description: EAS Build profiles, the release guard that stops dev-only edits reaching a store, TestFlight and Play flows, and the one-time setup.
sidebar_position: 4
---

# Mobile deployment

Status: **Proposed 2026-09-24**

`vegan-grove-mobile` ships through EAS Build. No `ios/` or `android/` directory exists in git: the native projects are generated on the build machine from `app.config.ts` and the config plugins (continuous native generation). A committed native directory is a review failure; it freezes plugin output and is where keys end up.

## Profiles

`eas.json` defines five profiles. All pin Node 24 and use the remote app version source.

| Profile | Distribution | Purpose |
|---|---|---|
| `development` | internal, dev client | day-to-day work; required because MapLibre is native and Expo Go cannot load it |
| `preview` | internal | a release-mode build for testers, installed by link, not through a store |
| `production` | store | the base the two store profiles extend |
| `testflight` | store, iOS | extends `production`, submits to TestFlight |
| `playstore` | store, Android app bundle | extends `production`, submits to the Play internal track |

`appVersionSource: "remote"` and `autoIncrement: true` on the store profiles mean EAS holds the build number and version code and bumps them per build. Nothing about versions is committed per release except the marketing `version` in `app.config.ts`, which is bumped by hand when the store listing changes.

## The three-layer release guard

The scaffold fails a store build if a development-only edit is still in the tree.

1. `scripts/check-prod-ready.sh` greps `app/`, `src/`, `app.config.ts`, and `eas.json` for `localhost`, `sk_live`, `AKIA`, `AIza`, and private IPv4 ranges, and exits non-zero on a hit.
2. `scripts/eas-build-pre-install.sh` runs it on the EAS build machine when `EAS_BUILD_PROFILE` is `production`, `testflight`, or `playstore`. A hit fails the build before `npm install`.
3. `npm run validate` runs the same script on every PR as `check:prod`.

The layers are redundant by design. One catches the edit at the PR, one at the build, and the script itself is the single definition of what a leak looks like. [Build and release](/mobile/build-and-release) lists the patterns and how to extend them.

## iOS: TestFlight

```bash
eas build --profile testflight --platform ios
eas submit --profile testflight --platform ios --latest
```

The build lands in TestFlight for internal testers immediately and for external testers after Apple's TestFlight review. App Store release is a manual promotion in App Store Connect after the build has been tested.

## Android: Play internal track

```bash
eas build --profile playstore --platform android
eas submit --profile playstore --platform android --latest
```

The bundle goes to the internal testing track. Promotion to closed, open, or production tracks is done in the Play Console. The first bundle for a new app cannot be submitted by EAS; it is uploaded by hand to create the app record.

## One-time setup

These need the maintainer's accounts and are done once:

- **EAS project**: `eas init` links the repo to a project and writes `extra.eas.projectId` into the config.
- **Apple app record**: bundle id `org.vegangrove.app` registered, app created in App Store Connect, and `ascAppId` placed in the `submit.testflight` profile. Signing certificates and the push key are managed by EAS, never downloaded into the repo.
- **Play listing**: package `org.vegangrove.app`, the listing created, the first bundle uploaded manually, and a service-account key stored as an EAS secret for later submissions.
- **Push**: the APNs key through EAS credentials, the FCM configuration file as an EAS file secret referenced from `app.config.ts`.

Free tier: 30 EAS builds a month on the lower-priority queue. Store profiles are used only after a `preview` build has been tested, so the quota goes a long way.
