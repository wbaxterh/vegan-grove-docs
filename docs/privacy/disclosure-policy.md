---
title: Disclosure policy
description: What these public docs, and the public repos, will never contain, and where that information lives instead.
sidebar_position: 4
---

# Disclosure policy

Status: **Proposed 2026-09-24**

The docs and all four repos are public. That is a feature: anyone can audit how member data is handled. It also means the docs are an attacker's map if they carry the wrong details. The Trick Book's public docs published a server IP, an instance id, an SSH command with the key name, port numbers, process names, a running ledger of unfixed critical vulnerabilities, and a feedback log with real names and quoted email. None of that is repeated here.

## Never in public docs or public repos

- IP addresses, instance ids, hostnames of specific machines, or cloud account ids.
- SSH commands, key or PEM names, usernames on hosts, file paths on hosts.
- Port numbers, PM2 process names, nginx server names beyond the public domains.
- Connection strings, even redacted ones. A redacted secret still tells a reader the shape and the location.
- A status table of open vulnerabilities. Fixes are announced after they ship, in [Releases](/releases).
- Member data of any kind: emails, names, handles quoted from real accounts, screenshots with real content, quoted messages or feedback.
- Personal email addresses of the maintainers. Contact goes through GitHub's private vulnerability reporting.

## Allowed

- Service names and regions: "EC2 in `us-east-1`", "MongoDB Atlas", "Amplify".
- Public domains: `vegangrove.org`, `api.vegangrove.org`, `docs.vegangrove.org`.
- Environment variable names, without values.
- Architecture, data model, API surface, threat model, and the reasoning behind decisions.
- Runbooks written with placeholders: `ssh <api-host>`, `<env-file>`.

## Where the sensitive version lives

Host-level runbooks, the instance inventory, and the credentials rotation checklist live in a private note outside any repo, maintained by the owner. If a second operator ever joins, that note becomes a private repo with the same governance files.

## Enforcement

- `secretlint` runs on every commit in every repo and treats a finding as a stop.
- `gitleaks` runs in CI over the full history.
- The PR template asks explicitly about infrastructure identifiers.
- This docs site's CI builds the whole site; a reviewer greps the diff for IP-shaped strings, `ssh `, `pm2`, and `.pem` before approving.
