---
title: Build and release
description: EAS profiles, exactly what the release guard scripts fail on, version bumping, and the store submission commands.
sidebar_position: 5
---

# Build and release

Status: **Scaffolded 2026-09-24**

Builds happen on EAS. The scaffold ships the profiles, the guard scripts, and the config; the EAS project, the Apple app record, and the Play listing are created once by the maintainer ([mobile deployment](/deployment/mobile)).

## Profiles

`eas.json`, all with `node: "24"`:

| Profile | `distribution` | `developmentClient` | `autoIncrement` | `env` | Extends |
|---|---|---|---|---|---|
| `development` | `internal` | `true` | | local or dev API URL | |
| `preview` | `internal` | | | production API URL | |
| `production` | `store` | | `true` | production API URL | |
| `testflight` | `store` | | `true` | | `production`, iOS |
| `playstore` | `store` | | `true` | Android `app-bundle` | `production` |

`cli.appVersionSource` is `remote`: EAS stores the iOS build number and Android version code and increments them on the store profiles. Two people building from the same commit cannot collide, and no version file churns in git.

## `scripts/check-prod-ready.sh`

Runs `grep -rEn` over `app/`, `src/`, `app.config.ts`, and `eas.json` and exits `1` on any match:

| Pattern | Catches |
|---|---|
| `localhost`, `127\.0\.0\.1`, `10\.0\.2\.2` | a dev API URL left in a constant or an env block |
| `sk_live` | a live payment or service key |
| `AKIA[0-9A-Z]{16}` | an AWS access key id |
| `AIza[0-9A-Za-z_-]{35}` | a Google API key |
| `\b10\.\d+\.\d+\.\d+\b`, `\b192\.168\.\d+\.\d+\b`, `\b172\.(1[6-9]\|2\d\|3[01])\.\d+\.\d+\b` | private network addresses, which usually means a laptop's LAN address in an API URL |

Lines ending in `// prod-ready: ignore` are excluded, for the one test fixture that needs a string shaped like a key. Adding a pattern is a one-line PR; the script is the single definition of "not ready".

`npm run check:prod` runs it locally and inside `validate`.

## `scripts/eas-build-pre-install.sh`

EAS runs this hook on its build machine before `npm install`:

```bash
case "$EAS_BUILD_PROFILE" in
  production|testflight|playstore) bash scripts/check-prod-ready.sh ;;
esac
```

A hit fails the build in its first seconds, before any credential is used. `development` and `preview` builds skip it because they are allowed to point at a local API.

## Versions

- `version` in `app.config.ts` (`1.2.0`) is the marketing version members see. Bump it by hand, with a `chore: release mobile 1.2.0` commit, when a store release is prepared.
- Build number and version code are remote and automatic. Never set them in `app.config.ts`.
- `runtimeVersion` follows the `appVersion` policy so an OTA update can never reach a binary with different native code.

## Commands

```bash
# development client, once per native change
eas build --profile development --platform ios
eas build --profile development --platform android

# testers, installed from a link
eas build --profile preview --platform all

# stores
eas build --profile testflight --platform ios
eas submit --profile testflight --platform ios --latest      # needs ascAppId in eas.json submit profile

eas build --profile playstore --platform android
eas submit --profile playstore --platform android --latest   # needs the service-account EAS secret
```

The submit profiles in `eas.json` carry placeholders (`ascAppId`, `appleTeamId`, `serviceAccountKeyPath` pointing at an EAS file secret) that the maintainer fills after the one-time store setup. The values are account identifiers, not secrets, but they are still filled in locally rather than in the docs.

## Before a store build

1. `npm run validate` green.
2. A `preview` build of the same commit installed and exercised on a device: sign in, map, an event, a message.
3. `version` bumped and the [release page](/releases) drafted.
4. Then the store profile build.
