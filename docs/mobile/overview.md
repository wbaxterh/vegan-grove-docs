---
title: Mobile overview
description: The Expo app's stack, source layout, why it needs a development client, and what the scaffold contains.
sidebar_position: 1
---

# Mobile overview

Status: **Scaffolded 2026-09-24**

`vegan-grove-mobile` is an Expo SDK 57 app with expo-router and TypeScript, built for iOS and Android from one codebase through EAS. It is the primary member surface: places on a map, events, the feed, messages, and the companion. It holds almost nothing on the device and never sends the device's location to the server.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Expo SDK 57, React Native 0.86, React 19 |
| Routing | expo-router, file-based, route groups `(auth)` and `(tabs)` |
| Map | `@maplibre/maplibre-react-native` with the OpenFreeMap `liberty` style |
| Server data | TanStack Query |
| Auth state | zustand, one store |
| Secrets on device | `expo-secure-store` for the session token |
| Images | `expo-image-picker` then `expo-image-manipulator` re-encode to strip EXIF |
| Location | `expo-location`, when-in-use, used only to center the map client-side |
| Push | `expo-notifications` |
| Lint, format | Biome, shared config |

No analytics SDK, no crash reporter with PII, no NativeWind, no form library. Styling is `StyleSheet` with tokens from `src/theme/tokens.ts`, the mobile mirror of the `--vg-*` values in the [tech stack](/architecture/tech-stack).

## Layout

```
app/
  _layout.tsx            providers, AuthGate, theme
  (auth)/                welcome, login, register, magic-link
  (tabs)/                index (home), places, events, feed, messages
  profile/               index, edit, settings, privacy, account (hidden from the tab bar)
  companion.tsx          modal
src/
  constants/api.ts       EXPO_PUBLIC_API_BASE_URL and the ENDPOINTS registry
  lib/api/client.ts      fetch wrapper: Bearer, timeout, normalized errors
  lib/stores/authStore.ts
  lib/images/stripExif.ts
  theme/tokens.ts
scripts/
  check-prod-ready.sh    the release guard
  gen-brand-assets.mjs   regenerates the placeholder brand PNGs
eas-build-pre-install.sh EAS lifecycle hook that reruns the guard on store profiles
app.config.ts            bundle id org.vegangrove.app, scheme vegangrove, plugins, env-sourced values
eas.json                 development, preview, production, testflight, playstore
```

Details: [navigation](/mobile/navigation), [state and data](/mobile/state-and-data), [API client](/mobile/api-client), [build and release](/mobile/build-and-release).

## Why a development client

MapLibre is native code, so Expo Go cannot run this app. Day-to-day development uses a development build from the `development` EAS profile installed on a simulator or device, then `npm start` (which runs `expo start --dev-client`). The build is made once per native dependency change, not per code change; JavaScript still hot-reloads.

`ios/` and `android/` are gitignored and never generated in the repo. Native configuration lives in `app.config.ts` and config plugins (the MapLibre plugin, `expo-notifications`, `expo-secure-store`, `expo-location`), and EAS generates the native projects on its build machine. See [mobile deployment](/deployment/mobile).

## What the scaffold contains

Every screen file above exists and renders a placeholder with the right title. The places tab renders the map centered on Southern California and queries `GET /api/places?bbox=` through TanStack Query as the viewport settles. Auth screens call the API client and store the session; `AuthGate` redirects. Profile, feed, events, messages, and the companion are stubs that will be filled per [milestone](/roadmap/milestones). `validate` (Biome, `tsc --noEmit`, `check:prod`) passes on a fresh clone.
