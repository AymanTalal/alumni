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
