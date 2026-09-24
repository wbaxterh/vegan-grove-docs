---
title: Error handling
description: The one error shape the API returns, how validation and authorization errors are chosen, and how clients normalize them.
sidebar_position: 6
---

# Error handling

Status: **Scaffolded 2026-09-24**

Every error the API returns has one shape, is produced by one class, and is rendered by one middleware. Clients normalize it to one object. There is no second path.

## The envelope

```json
{ "error": { "code": "validation_error", "message": "Invalid request.", "details": [ ... ] } }
```

`code` is a stable snake_case identifier clients switch on. `message` is safe to show a member. `details` is optional and only present when it helps the client (field errors); it is never a stack, an internal id, or a database error string.

## `AppError`

`src/lib/errors.ts` defines `AppError(status, code, message, details?)` and short constructors: `badRequest(code, message, details?)`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict(code, message)`, `unavailable(code, message)`, and `notImplemented`, the handler every milestone-2 route stub uses. Throw or `next()` an `AppError` from anywhere below the router and the error handler renders `toBody()` with the status.

Anything that is not an `AppError` (a Mongoose cast error, a thrown string, a bug) becomes `500 { error: { code: 'internal_error', message: 'Something went wrong.' } }`. The original error and its stack go to the log with the request id, never to the client, in any environment. `NODE_ENV=development` gets the same body; the detail is in the terminal.

## Validation at the boundary

Each route declares zod schemas for `body`, `query`, and `params`, applied by the `validate` middleware before the handler runs. A failed parse returns `400 validation_error` with one entry per issue:

```json
{ "error": { "code": "validation_error", "message": "Invalid request.",
  "details": [{ "path": "body.handle", "message": "must be 3 to 24 characters of a-z, 0-9, _" }] } }
```

Handlers therefore never see an unvalidated field, and the principal never comes from a body field: it is `req.session.userId`, set by the auth middleware.

## 401, 403, or 404

| Situation | Status | Code |
|---|---|---|
| No session, expired session, bad token | `401` | `unauthenticated` |
| Valid session, wrong role, resource is public knowledge | `403` | `forbidden` |
| Valid session, resource exists but the caller may not see it | `404` | `not_found` |
| Resource does not exist | `404` | `not_found` |

The third row is the privacy rule. A friends-only post, a private place list, someone else's conversation, another member's sessions: a `403` would confirm the thing exists and often who owns it. So the API answers `404`, identical to the not-found case, whenever the caller's right to know the resource exists is itself in question. `403` is reserved for cases where existence is public and only the action is restricted: a member calling an organizer-only attendee list for a public event, or a non-admin calling `/api/admin/*`.

`501 not_implemented` marks scaffold stubs and is removed with the route, see [API endpoints](/backend/api-endpoints).

## Client normalization

Both clients reduce every failure to `{ message, status, code }`:

- The envelope maps directly.
- A non-JSON response (nginx 502, a timeout page) becomes `status` from the response and `code: 'http_error'`.
- A network failure or abort becomes `status: 0`, `code: 'network_error'`.

Screens switch on `code` for behavior (`unauthenticated` signs out, `validation_error` highlights fields, `rate_limited` shows a wait) and show `message` for everything else. The mobile [API client](/mobile/api-client) and the web `src/lib/api.ts` implement the same table.

## Rate limits

`express-rate-limit` on `/api/auth/*` and the companion route returns `429 { error: { code: 'rate_limited' } }` with `Retry-After`. Limits are per client address behind `TRUST_PROXY`; the address is not logged.
