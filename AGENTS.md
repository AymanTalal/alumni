<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# API routes

Before adding or changing any API route under `app/api/`, read the "📘 API Documentation" section in `README.md`. Every API route change must be reflected in the Swagger/OpenAPI spec at `lib/openapi.ts` in the same commit.

The same applies to page routes (`app/users/`, `app/announcements/` and any new page route): when a page route is added, renamed or removed, update `lib/openapi.ts` and the route tables in `README.md` in the same commit.

# Data layer

Whenever a change touches the data layer — migrations, models (`lib/models/`), tables or columns, factories, the seed, relationships, or validation rules — update `ddd.md` in the same piece of work, along with the matching parts of `README.md`. Every new migration must also be reflected in the "🧱 Migrations" section of `README.md`.

# Middleware and errors (JSON API)

The design is described in the "🧩 Middleware" section of `README.md`; the error shapes are in "Error shapes of the JSON API" in `ddd.md`. Every API request goes through: logger → error handler → 404 guard → controller → model.

- Every handler exported from an `app/api/**/route.ts` must be wrapped in `withApiMiddleware(...)` (routes without an id) or `withExistingResource("<resource>")(...)` (routes with an `[id]`), both from `lib/middleware/index.ts`. Never export a bare handler.
- A new middleware is added to the lines in `lib/middleware/index.ts` (with `chain`), not to the route files. Keep the logger first and the error handler second.
- Every JSON 404 uses `notFound(reason)` from `lib/http/notFound.ts`: `{ "error": "not found", "reason": "…" }`. Every 5xx uses `internalError()` / `serviceUnavailable()` from `lib/http/serverError.ts`. Don't build these bodies by hand.
- Controllers and Models do not catch unexpected errors (no `try/catch` around database calls, no log-and-rethrow): they let them go to `withErrorHandler`, which answers 503 / 500, logs the stack once and writes `logs/error.log`. Expected outcomes (validation, invalid id, not found, already applied) are returned as results, not thrown.
- Never put an error message, stack trace, SQL, table or constraint name, or file path in a response body. Never log request bodies, headers, cookies or query values.
- Page requests are handled by `proxy.ts` (log line + 308 redirects, rules in `lib/routing/pageRedirect.ts`). It must never match `/api`, `/_next` or files in `public/`. Unknown page URLs show the 404 page (`app/not-found.tsx`); never redirect them to the home page.
- `logs/` is never committed: only `logs/.gitkeep` is tracked (`.gitignore`), and `logs` stays in `.dockerignore`.
- Planned, not implemented yet: the job posting rules in `ddd.md` ("Job posting rules (planned)") and the validation middleware (400 `{ "error": "validation failed", "fields": { … } }`). Keep them marked "planned" in the docs until they are built.
