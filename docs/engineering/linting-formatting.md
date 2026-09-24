---
title: Linting and formatting
description: The shared Biome configuration, why each setting is what it is, and the Windows line-ending trap.
sidebar_position: 3
---

# Linting and formatting

Status: **Scaffolded 2026-09-24**

One tool, Biome 2.5.x, does linting, formatting, and import sorting in all four repos. No ESLint, no Prettier, no per-repo drift: `biome.json` is copied from `shared/` and the `$schema` line is pinned to the installed version so the editor extension and the CLI agree.

## The configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.14/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignoreUnknown": true },
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 100, "lineEnding": "lf" },
  "linter": {
    "rules": {
      "recommended": true,
      "complexity": { "noExcessiveCognitiveComplexity": { "level": "warn", "options": { "maxAllowedComplexity": 15 } } },
      "correctness": { "noUnusedImports": "error", "noUnusedVariables": "error" },
      "style": { "useConst": "error" },
      "suspicious": { "noConsole": "warn" }
    }
  },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always", "trailingCommas": "all" } },
  "assist": { "actions": { "source": { "organizeImports": "on" } } }
}
```

## Why these settings

- **100 columns.** Wide enough for a zod schema or a Mongoose index line without wrapping, narrow enough for two files side by side.
- **Single quotes, semicolons, trailing commas.** Matches the Express, Expo, and Next ecosystems' defaults, so pasted examples do not get reformatted into noise.
- **LF, always.** The repos are edited on Windows and built on Linux (CI, EC2, Amplify, EAS). One line ending in git means one diff. `.gitattributes` (`* text=auto eol=lf`) and `.editorconfig` say the same thing so the three tools never disagree.
- **Cognitive complexity 15, warn.** A route handler that trips this is usually doing validation, authorization, and the query in one function. The warning is a prompt to move a piece into `services/`, not a build failure.
- **Unused imports and variables are errors.** In a privacy-sensitive codebase an unused import is often a leftover from a removed data path. It fails the build so it gets removed rather than accumulated.
- **`noConsole` warns.** The API logs through [pino](/engineering/logging); a `console.log` in a route is a body waiting to be printed.
- **`useIgnoreFile`.** Biome honors `.gitignore`, so `node_modules`, `build`, `.next`, and `dist` are never scanned.

## Commands

```bash
npm run lint        # biome check .
npm run lint:fix    # biome check --write .
```

`lint-staged` runs `biome check --write` on staged files at commit time, see [pre-commit hooks](/engineering/pre-commit-hooks).

## The CRLF trap on Windows

If git checks a file out with CRLF (a global `core.autocrlf=true` from before `.gitattributes` existed, or a file created by a Windows tool), Biome reports a format error on every line of it and `validate` fails while the code looks fine. Confirm with `file <path>` in Git Bash; it prints `with CRLF line terminators`. Fix the file in place:

```bash
sed -i 's/\r$//' path/to/file.ts
```

For a whole checkout after fixing attributes: `git add --renormalize .` then commit. PowerShell's `Out-File` also writes a UTF-8 BOM by default, which Biome flags too; write files from Git Bash or with `-Encoding ascii` when the content allows.
