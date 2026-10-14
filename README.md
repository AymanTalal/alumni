# 🎓 Alumni Tracking System

> A modern web platform to connect universities with their graduates — built as a semester-long project for the Web Programming course, with the goal of being adopted as the university's official alumni tracking system.

---

## 📖 About The Project

Most universities lose touch with their graduates shortly after they leave campus. There is no easy way for the school to know where alumni ended up working, invite them back for events, or let current students network with people who walked the same halls.

This project is a full-stack **Alumni Tracking System** built from scratch as part of a university Web Programming course. Every student in the course builds their own version of this system as a semester-long assignment, delivered incrementally, week by week. The strongest implementation will be considered for real deployment as the university's official alumni platform.

This repository documents that build from day one — architecture decisions, weekly progress, and the reasoning behind them — both for course evaluation and as a portfolio piece.

### Goals

- Give the university a simple, searchable record of its alumni
- Let alumni keep their own profile (career, contact info) up to date
- Give staff/admins an easy way to manage and export alumni data
- Build something clean and real enough to actually be used after the course ends

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) — handles both frontend and backend (API routes) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| API Docs | [Swagger UI](https://swagger.io/tools/swagger-ui/) (OpenAPI 3) |
| Database | [PostgreSQL](https://www.postgresql.org/) 17 — runs in Docker; the app reads and writes it with **plain SQL** through the [`pg`](https://node-postgres.com/) driver (`lib/db.ts`), no ORM |
| Migrations | Plain SQL files in `migrations/`, run by a small Node script (`scripts/migrate.mjs`) using the [`pg`](https://node-postgres.com/) driver — no ORM or migration framework |
| Containerization | [Docker](https://www.docker.com/) + Docker Compose — one command (`docker compose up`) starts the app and the database, with a volume that keeps the database files |
| Version Control | Git + GitHub |
| Deployment (planned) | TBD |

---

## ✨ Features

This project is being built incrementally over the semester. Status is updated weekly.

- [x] **Week 2 — Routing** — static pages (`/`, `/about`), plain-text route handlers (`/hello`), and dynamic routes that read URL parameters (`/hello/[name]`, `/sum/[number1]/[number2]`)
- [x] **Week 3 — REST API** — full CRUD for users under `/api/users` (`GET`, `POST`, and `GET` / `PUT` / `PATCH` / `DELETE` by id), a health check at `/api/health`, and interactive Swagger docs at `/api/swagger` (users are kept in memory for now)
- [x] **Week 4 — MVC architecture** — User Model, `UserController` / `ApiUserController`, view components, and full CRUD user pages (`/users`) using Server Actions
- [x] **Announcements** — the same MVC structure for announcements: Model, two controllers, `/api/announcements` and full CRUD pages at `/announcements`
- [x] **Week 5 — Docker** — the whole system starts with a single `docker compose up`; [the forgetting test](#-the-forgetting-test) shows why in-memory data isn't enough
- [x] **Week 5 — Database service** — a PostgreSQL container next to the app, with a named volume (`pgdata`) so its data survives `docker compose down`, and the [data design](ddd.md) for it
- [x] **Week 5 — Migrations** — plain SQL migrations create the `users` and `announcements` tables automatically on `docker compose up` ([🧱 Migrations](#-migrations))
- [x] **Week 5 — Factories and seeding** — factories build realistic sample users and announcements, and a seed script inserts them into PostgreSQL on demand ([🌱 Factories and Seeding](#-factories-and-seeding))
- [x] **Week 5 — Database** — the Models store users and announcements in PostgreSQL with parameterized plain SQL (`lib/db.ts`), so data survives restarts and `docker compose down` ([🧪 The Forgetting Test](#-the-forgetting-test))

---

## 📂 Project Structure

```
alumni/
├── app/                              # Next.js App Router — every folder is a URL segment
│   ├── layout.tsx                    # Root layout shared by all pages
│   ├── globals.css                   # Global styles (Tailwind CSS)
│   ├── favicon.ico                   # Browser tab icon
│   ├── page.tsx                      # /                   temporary homepage with links to Users and Announcements
│   ├── about/page.tsx                # /about              temporary about page
│   ├── users/
│   │   ├── page.tsx                  # GET /users          user list + "Add a user" form  → UserController
│   │   ├── actions.ts                # Server Actions      create, update, delete         → UserController
│   │   └── [id]/
│   │       ├── page.tsx              # GET /users/{id}     one user's profile (HTML)      → UserController
│   │       ├── not-found.tsx         #                     "User not found" page (404)
│   │       └── edit/
│   │           └── page.tsx          # GET /users/{id}/edit  edit form (HTML)             → UserController
│   ├── announcements/
│   │   ├── page.tsx                  # GET /announcements  list + "Add an announcement" form → AnnouncementController
│   │   ├── actions.ts                # Server Actions      create, update, delete         → AnnouncementController
│   │   └── [id]/
│   │       ├── page.tsx              # GET /announcements/{id}  one announcement (HTML)   → AnnouncementController
│   │       ├── not-found.tsx         #                     "Announcement not found" page (404)
│   │       └── edit/
│   │           └── page.tsx          # GET /announcements/{id}/edit  edit form (HTML)     → AnnouncementController
│   ├── hello/
│   │   ├── route.ts                  # /hello              "Hello, World!"
│   │   └── [name]/route.ts           # /hello/{name}       "Hello, {name}!"
│   ├── sum/[number1]/[number2]/
│   │   └── route.ts                  # /sum/{a}/{b}        sum of two numbers
│   └── api/
│       ├── health/route.ts           # /api/health         health check
│       ├── users/route.ts            # /api/users          list & create users (JSON)     → ApiUserController
│       ├── users/[id]/route.ts       # /api/users/{id}     get, replace, update, delete   → ApiUserController
│       ├── announcements/route.ts    # /api/announcements  list & create (JSON)           → ApiAnnouncementController
│       ├── announcements/[id]/route.ts  # /api/announcements/{id}  get, replace, update, delete → ApiAnnouncementController
│       └── swagger/
│           ├── page.tsx              # /api/swagger        interactive API docs
│           └── SwaggerView.tsx       # Client component that renders Swagger UI
├── lib/
│   ├── db.ts                         # Shared PostgreSQL connection pool + query(text, params) helper
│   ├── controllers/
│   │   ├── databaseErrors.ts         # Turns database errors into clear 400s / a generic 500
│   │   ├── ApiUserController.ts      # User CRUD for the JSON API: Request in, NextResponse.json out
│   │   ├── UserController.ts         # User CRUD for pages: plain arguments in, { user } / { error } out
│   │   ├── ApiAnnouncementController.ts  # Announcement CRUD for the JSON API: Request in, NextResponse.json out
│   │   └── AnnouncementController.ts # Announcement CRUD for pages: plain arguments in, { announcement } / { error } out
│   ├── models/
│   │   ├── user.ts                   # User Model: CRUD functions in plain SQL on the users table
│   │   └── announcement.ts           # Announcement Model: CRUD functions in plain SQL on the announcements table
│   ├── views/
│   │   ├── users/
│   │   │   ├── UserListView.tsx      # Table of users with View / Edit / Delete (markup only)
│   │   │   ├── UserDetailView.tsx    # One user's fields + Edit / Delete (markup only)
│   │   │   ├── UserCreateForm.tsx    # "Add a user" form: name*, email, age (markup only)
│   │   │   ├── UserEditForm.tsx      # "Edit user" form, pre-filled (markup only)
│   │   │   └── DeleteUserButton.tsx  # Delete button that asks for confirmation (markup only)
│   │   └── announcements/
│   │       ├── AnnouncementListView.tsx      # Table: title, author, date + View / Edit / Delete (markup only)
│   │       ├── AnnouncementDetailView.tsx    # Full announcement + Edit / Delete (markup only)
│   │       ├── AnnouncementCreateForm.tsx    # "Add an announcement" form: title*, content*, author (markup only)
│   │       ├── AnnouncementEditForm.tsx      # "Edit announcement" form, pre-filled (markup only)
│   │       ├── DeleteAnnouncementButton.tsx  # Delete button that asks for confirmation (markup only)
│   │       └── formatDate.ts                 # Formats the ISO dates for display
│   └── openapi.ts                    # OpenAPI spec rendered at /api/swagger
├── migrations/                       # Plain SQL database migrations, applied in number order
│   ├── 001_create_users.up.sql       # Creates the users table
│   ├── 001_create_users.down.sql     # Drops it again
│   ├── 002_create_announcements.up.sql    # Creates the announcements table (+ newest-first index)
│   └── 002_create_announcements.down.sql  # Drops it again
├── scripts/
│   ├── migrate.mjs                   # Migration runner: npm run migrate / npm run migrate:down
│   ├── seed.mjs                      # Seed script: npm run seed / npm run seed:fresh
│   ├── factories/
│   │   ├── userFactory.mjs           # Builds sample users (makeUser, makeUsers)
│   │   └── announcementFactory.mjs   # Builds sample announcements (makeAnnouncement, makeAnnouncements)
│   └── lib/
│       └── database.mjs              # Shared by the scripts: reads DATABASE_URL, connects, clear errors
├── ddd.md                            # Data Design Documentation: the data, its rules and the PostgreSQL tables
├── AGENTS.md                         # Instructions for AI coding assistants
├── CLAUDE.md                         # Points Claude Code at AGENTS.md
├── package.json                      # Dependencies & npm scripts (dev, build, start, lint, migrate, migrate:down, seed, seed:fresh)
├── package-lock.json                 # Exact installed dependency versions
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration (`@/` import alias)
├── next-env.d.ts                     # Next.js TypeScript types (auto-generated)
├── eslint.config.mjs                 # Linting rules
├── postcss.config.mjs                # Loads Tailwind CSS
├── Dockerfile                        # Builds the app and runs it in production mode (npm start) on port 3000
├── docker-compose.yml                # `docker compose up`: db (port 5432, pgdata volume) → migrate (runs once) → app (port 3000, no volume); seed (on demand, "seed" profile)
├── .dockerignore                     # Keeps node_modules, .next, .git, .env files out of the image
├── .env.example                      # Development defaults for the database settings (copy to .env to change them)
├── .gitignore
└── README.md
```

*(Structure will evolve as the project grows — this section is kept up to date. See **🏗️ MVC Architecture** below for what role each file plays.)*

---

## 🏗️ MVC Architecture

### MVC in a nutshell

**MVC (Model–View–Controller)** splits an application into three responsibilities:

- **Model** — the data and the rules for reading and changing it
- **View** — what the user sees (HTML pages, or the JSON an API returns)
- **Controller** — receives a request, asks the Model for data, and decides which response (View) to send back

### How it maps onto Next.js in this project

Next.js App Router isn't an MVC framework — it organises code by **URL** (folders under `app/`), not by role. The MVC roles still exist, they just live in Next.js file conventions. Every user request now follows the same path, and for pages a View component renders the result:

```
Route / Page / Server Action  →  Controller  →  Model  →  lib/db.ts  →  PostgreSQL
                                     │
                                     └──→  View component renders the result (pages only)
```

| Request | Route (file Next.js picks) | Controller | Model |
|---|---|---|---|
| `GET` / `POST` `/api/users` | `app/api/users/route.ts` | `ApiUserController.getAll` / `create` | `lib/models/user.ts` |
| `GET` / `PUT` / `PATCH` / `DELETE` `/api/users/{id}` | `app/api/users/[id]/route.ts` | `ApiUserController.getById` / `replace` / `update` / `delete` | `lib/models/user.ts` |
| `GET /users` | `app/users/page.tsx` → renders `UserListView` + `UserCreateForm` | `UserController.getAll` | `lib/models/user.ts` |
| `POST /users` (the form) | Server Action `createUserAction` in `app/users/actions.ts` | `UserController.create` | `lib/models/user.ts` |
| `GET /users/{id}` | `app/users/[id]/page.tsx` → renders `UserDetailView` | `UserController.getById` | `lib/models/user.ts` |
| `GET /users/{id}/edit` | `app/users/[id]/edit/page.tsx` → renders `UserEditForm` | `UserController.getById` | `lib/models/user.ts` |
| Save the edit form | Server Action `updateUserAction` in `app/users/actions.ts` | `UserController.update` | `lib/models/user.ts` |
| **Delete** button | Server Action `deleteUserAction` in `app/users/actions.ts` | `UserController.delete` | `lib/models/user.ts` |
| `GET` / `POST` `/api/announcements` | `app/api/announcements/route.ts` | `ApiAnnouncementController.getAll` / `create` | `lib/models/announcement.ts` |
| `GET` / `PUT` / `PATCH` / `DELETE` `/api/announcements/{id}` | `app/api/announcements/[id]/route.ts` | `ApiAnnouncementController.getById` / `replace` / `update` / `delete` | `lib/models/announcement.ts` |
| `GET /announcements` | `app/announcements/page.tsx` → renders `AnnouncementListView` + `AnnouncementCreateForm` | `AnnouncementController.getAll` | `lib/models/announcement.ts` |
| `POST /announcements` (the form) | Server Action `createAnnouncementAction` in `app/announcements/actions.ts` | `AnnouncementController.create` | `lib/models/announcement.ts` |
| `GET /announcements/{id}` | `app/announcements/[id]/page.tsx` → renders `AnnouncementDetailView` | `AnnouncementController.getById` | `lib/models/announcement.ts` |
| `GET /announcements/{id}/edit` | `app/announcements/[id]/edit/page.tsx` → renders `AnnouncementEditForm` | `AnnouncementController.getById` | `lib/models/announcement.ts` |
| Save the announcement edit form | Server Action `updateAnnouncementAction` in `app/announcements/actions.ts` | `AnnouncementController.update` | `lib/models/announcement.ts` |
| Announcement **Delete** button | Server Action `deleteAnnouncementAction` in `app/announcements/actions.ts` | `AnnouncementController.delete` | `lib/models/announcement.ts` |

| MVC role | In this project | Notes |
|---|---|---|
| **Model** | `lib/models/user.ts` — the User Model: async CRUD functions (`createUser`, `getAllUsers`, `getUserById`, `replaceUser`, `updateUser`, `deleteUser`) that run **plain, parameterized SQL** on the `users` table. `lib/models/announcement.ts` — the Announcement Model, built the same way (`createAnnouncement`, `getAllAnnouncements`, `getAnnouncementById`, `replaceAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`) on the `announcements` table. Both talk to PostgreSQL only through `query()` in `lib/db.ts` | No HTTP or Next.js code. The Models map `snake_case` columns to the `camelCase` fields the controllers and views use (e.g. `created_at` → `createdAt`), and return users in the same flat shape as before (`extra` jsonb fields side by side with the columns). Every query uses `$1, $2, …` parameters, never string concatenation, and `INSERT / UPDATE / DELETE … RETURNING` so one query does the job. |
| **Controller** | `lib/controllers/ApiUserController.ts` and `lib/controllers/UserController.ts`, plus the `route.ts` files, pages and Server Actions that call them. `lib/controllers/ApiAnnouncementController.ts` and `lib/controllers/AnnouncementController.ts` for announcements, called by the `app/api/announcements/` routes and the `app/announcements/` pages | Validation and request handling live in the controllers; they `await` the async Models. Database errors are turned into clear messages by `lib/controllers/databaseErrors.ts` (a 400 when the data caused it, otherwise a generic 500 for the API or a friendly `{ error }` for the pages, with the real error logged on the server only). The `route.ts` files, pages and the `actions.ts` files are thin: they call the matching controller function and pass the result on. |
| **View** | `lib/views/users/` (`UserListView`, `UserDetailView`, `UserCreateForm`, `UserEditForm`, `DeleteUserButton`), `lib/views/announcements/` (`AnnouncementListView`, `AnnouncementDetailView`, `AnnouncementCreateForm`, `AnnouncementEditForm`, `DeleteAnnouncementButton`), `page.tsx` files and `layout.tsx`, plus the JSON bodies the API returns | The components in `lib/views/` contain only markup and Tailwind classes: they get data and Server Actions through props and never call a controller or the Model. The `app/users/` and `app/announcements/` pages fetch the data from `UserController` and hand it to the views. For the API there is no separate view file — `NextResponse.json(...)` in `ApiUserController` *is* the view. |

The mapping is loose in a few places. Next.js itself does the job of a router/front controller (matching a URL to a file), and `/hello`, `/sum` and `/api/health` are small `route.ts` files that do their own work without a Model.

**Two user controllers, one Model.** `ApiUserController` is for the JSON API: its functions take the `Request` (and route params), call the Model, and return `NextResponse.json(...)` with the right status code (201, 400, 404). `UserController` is for pages: its functions take plain arguments and return plain objects like `{ user }` or `{ error }` that a `page.tsx` can render, with no HTTP code at all. Both use the same validation rule (`name` is required) and the same User Model, so the API and the pages always show the same data — a user created with `POST /api/users` appears at `/users`, and a user created with the form on `/users` appears at `GET /api/users`.

**Two announcement controllers, one Model.** Announcements follow the same split: `ApiAnnouncementController` takes the `Request` and returns `NextResponse.json(...)` (201, 400, 404) for the `/api/announcements` routes, while `AnnouncementController` takes plain arguments and returns `{ announcement }`, `{ announcements }`, `{ id }` or `{ error }` for the `/announcements` pages. An announcement created, edited or deleted with `/api/announcements` shows the change at `/announcements` straight away, and the other way round. Both require a non-empty `title` and `content`, and both reject an id that isn't a whole number (`abc`, `1.5`) — the API side with **400**, unlike the user controllers, which report such ids as **404** "not found".

**Why Server Actions for the page forms?** Next.js can't have a `page.tsx` and a `route.ts` for the same URL, so the `/users` and `/announcements` pages can't have normal `POST` / `PUT` / `DELETE` route handlers. Instead, each form's `action` is a **Server Action** (`app/users/actions.ts` and `app/announcements/actions.ts`, marked `"use server"`): when the form is submitted, the browser sends a `POST` to the page it's on and Next.js runs that function on the server. The edit forms and the Delete buttons attach the record's id with `action.bind(null, id)`, as the Next.js forms guide recommends.

### All user and announcement routes

#### Users

**Pages (UserController)** — HTML for people using a browser:

| Method / action | URL | CRUD |
|---|---|---|
| `GET` | `/users` | **Read** — list all users |
| Server Action `createUserAction` (form `POST`) | `/users` | **Create** |
| `GET` | `/users/{id}` | **Read** — one user ("User not found" if the id doesn't exist) |
| `GET` | `/users/{id}/edit` | **Read** — the edit form, pre-filled ("User not found" if missing) |
| Server Action `updateUserAction` (form `POST`) | `/users/{id}/edit` | **Update** — then redirects to `/users/{id}` |
| Server Action `deleteUserAction` (form `POST`) | `/users` or `/users/{id}` | **Delete** — then redirects to `/users` |

**API (ApiUserController)** — JSON for Postman, scripts and other programs:

| Method | URL | CRUD |
|---|---|---|
| `GET` | `/api/users` | **Read** — list all users |
| `POST` | `/api/users` | **Create** |
| `GET` | `/api/users/{id}` | **Read** — one user |
| `PUT` | `/api/users/{id}` | **Update** — replace the whole user |
| `PATCH` | `/api/users/{id}` | **Update** — change only the fields sent |
| `DELETE` | `/api/users/{id}` | **Delete** |

Both sides go through the same User Model, so a change made on one side shows up on the other straight away.

#### Announcements

**Pages (AnnouncementController)** — HTML for people using a browser:

| Method / action | URL | CRUD |
|---|---|---|
| `GET` | `/announcements` | **Read** — list all announcements, newest first |
| Server Action `createAnnouncementAction` (form `POST`) | `/announcements` | **Create** |
| `GET` | `/announcements/{id}` | **Read** — one announcement ("Announcement not found" if the id doesn't exist) |
| `GET` | `/announcements/{id}/edit` | **Read** — the edit form, pre-filled ("Announcement not found" if missing) |
| Server Action `updateAnnouncementAction` (form `POST`) | `/announcements/{id}/edit` | **Update** — then redirects to `/announcements/{id}` |
| Server Action `deleteAnnouncementAction` (form `POST`) | `/announcements` or `/announcements/{id}` | **Delete** — then redirects to `/announcements` |

**API (ApiAnnouncementController)** — JSON for Postman, scripts and other programs:

| Method | URL | CRUD |
|---|---|---|
| `GET` | `/api/announcements` | **Read** — list all announcements, newest first |
| `POST` | `/api/announcements` | **Create** |
| `GET` | `/api/announcements/{id}` | **Read** — one announcement |
| `PUT` | `/api/announcements/{id}` | **Update** — replace the whole announcement |
| `PATCH` | `/api/announcements/{id}` | **Update** — change only the fields sent |
| `DELETE` | `/api/announcements/{id}` | **Delete** |

Both sides go through the same Announcement Model, so a change made on one side shows up on the other straight away. All of this data is stored in **PostgreSQL**, so it survives restarts and `docker compose down`.

### Files by MVC role

```
alumni/
├── app/
│   ├── layout.tsx                    [View]        root HTML layout around every page
│   ├── globals.css                   [View]        global styles
│   ├── favicon.ico                   [View]        tab icon
│   ├── page.tsx                      [View]        /
│   ├── about/page.tsx                [View]        /about
│   ├── users/page.tsx                [Page]        GET /users      → UserController, rendered by lib/views
│   ├── users/actions.ts              [Action]      create / update / delete → UserController
│   ├── users/[id]/page.tsx           [Page]        GET /users/{id} → UserController, rendered by lib/views
│   ├── users/[id]/edit/page.tsx      [Page]        GET /users/{id}/edit → UserController, rendered by lib/views
│   ├── users/[id]/not-found.tsx      [View]        "User not found" (404)
│   ├── announcements/page.tsx        [Page]        GET /announcements      → AnnouncementController, rendered by lib/views
│   ├── announcements/actions.ts      [Action]      create / update / delete → AnnouncementController
│   ├── announcements/[id]/page.tsx   [Page]        GET /announcements/{id} → AnnouncementController, rendered by lib/views
│   ├── announcements/[id]/edit/page.tsx  [Page]    GET /announcements/{id}/edit → AnnouncementController, rendered by lib/views
│   ├── announcements/[id]/not-found.tsx  [View]    "Announcement not found" (404)
│   ├── hello/route.ts                [Controller]  /hello
│   ├── hello/[name]/route.ts         [Controller]  /hello/{name}
│   ├── sum/[number1]/[number2]/route.ts  [Controller]  /sum/{a}/{b}
│   └── api/
│       ├── health/route.ts           [Controller]  /api/health
│       ├── users/route.ts            [Route]       /api/users      → ApiUserController
│       ├── users/[id]/route.ts       [Route]       /api/users/{id} → ApiUserController
│       ├── announcements/route.ts    [Route]       /api/announcements      → ApiAnnouncementController
│       ├── announcements/[id]/route.ts  [Route]    /api/announcements/{id} → ApiAnnouncementController
│       └── swagger/
│           ├── page.tsx              [View]        /api/swagger
│           └── SwaggerView.tsx       [View]        Swagger UI component
├── lib/
│   ├── db.ts                         [Model]       PostgreSQL connection pool + query() helper
│   ├── controllers/
│   │   ├── databaseErrors.ts         [Controller]  database errors → 400 / 500 / { error }
│   │   ├── ApiUserController.ts      [Controller]  user CRUD for the JSON API
│   │   ├── UserController.ts         [Controller]  user CRUD for pages
│   │   ├── ApiAnnouncementController.ts  [Controller]  announcement CRUD for the JSON API
│   │   └── AnnouncementController.ts [Controller]  announcement CRUD for pages
│   ├── models/user.ts                [Model]       users table: CRUD in plain SQL
│   ├── models/announcement.ts        [Model]       announcements table: CRUD in plain SQL
│   ├── views/users/UserListView.tsx  [View]        table of users
│   ├── views/users/UserDetailView.tsx  [View]      one user
│   ├── views/users/UserCreateForm.tsx  [View]      "Add a user" form
│   ├── views/users/UserEditForm.tsx  [View]        "Edit user" form
│   ├── views/users/DeleteUserButton.tsx  [View]    Delete button with confirmation
│   ├── views/announcements/AnnouncementListView.tsx    [View]  table of announcements
│   ├── views/announcements/AnnouncementDetailView.tsx  [View]  one announcement
│   ├── views/announcements/AnnouncementCreateForm.tsx  [View]  "Add an announcement" form
│   ├── views/announcements/AnnouncementEditForm.tsx    [View]  "Edit announcement" form
│   ├── views/announcements/DeleteAnnouncementButton.tsx  [View]  Delete button with confirmation
│   └── openapi.ts                    [Other]       API documentation (OpenAPI spec)
└── config files                      [Config]      package.json, next.config.ts, tsconfig.json, …
```

| File / folder | What it does | MVC role |
|---|---|---|
| `app/` | All routes. Each folder is a URL segment; `page.tsx` = a page, `route.ts` = an API endpoint | — (routing) |
| `app/layout.tsx` | Root `<html>`/`<body>` wrapper, fonts and page metadata shared by every page | View |
| `app/globals.css` | Tailwind CSS import and global colours / fonts | View |
| `app/favicon.ico` | Browser tab icon | View |
| `app/page.tsx` | `GET /` — temporary homepage with links to **Users** and **Announcements** | View |
| `app/about/page.tsx` | `GET /about` — temporary about page | View |
| `app/users/page.tsx` | `GET /users` — calls `UserController.getAll()` and renders `UserCreateForm` above `UserListView`. Renders on every request (`connection()`), so new users always show | Page (Route → Controller → View) |
| `app/users/actions.ts` | The three Server Actions behind the page forms. `createUserAction` → `UserController.create`, returns the error or a success message. `updateUserAction` → `UserController.update`, returns the error or redirects to `/users/{id}`. `deleteUserAction` → `UserController.delete`, returns "not found" or redirects to `/users`. Each calls `revalidatePath` after a change | Controller entry points (Server Actions) |
| `app/users/[id]/page.tsx` | `GET /users/{id}` — calls `UserController.getById(id)` and renders `UserDetailView`; unknown id → `notFound()` | Page (Route → Controller → View) |
| `app/users/[id]/edit/page.tsx` | `GET /users/{id}/edit` — calls `UserController.getById(id)` and renders `UserEditForm`; unknown id → `notFound()` | Page (Route → Controller → View) |
| `app/users/[id]/not-found.tsx` | The "User not found" page, returned with HTTP 404 for `/users/{id}` and `/users/{id}/edit` | View |
| `app/announcements/page.tsx` | `GET /announcements` — calls `AnnouncementController.getAll()` and renders `AnnouncementCreateForm` above `AnnouncementListView`. Renders on every request (`connection()`) | Page (Route → Controller → View) |
| `app/announcements/actions.ts` | The three Server Actions behind the announcement forms. `createAnnouncementAction` → `AnnouncementController.create`, returns the error or a success message. `updateAnnouncementAction` → `AnnouncementController.update`, returns the error or redirects to `/announcements/{id}`. `deleteAnnouncementAction` → `AnnouncementController.delete`, returns "not found" or redirects to `/announcements`. Each calls `revalidatePath` after a change | Controller entry points (Server Actions) |
| `app/announcements/[id]/page.tsx` | `GET /announcements/{id}` — calls `AnnouncementController.getById(id)` and renders `AnnouncementDetailView`; unknown or invalid id → `notFound()` | Page (Route → Controller → View) |
| `app/announcements/[id]/edit/page.tsx` | `GET /announcements/{id}/edit` — calls `AnnouncementController.getById(id)` and renders `AnnouncementEditForm`; unknown or invalid id → `notFound()` | Page (Route → Controller → View) |
| `app/announcements/[id]/not-found.tsx` | The "Announcement not found" page, returned with HTTP 404 for `/announcements/{id}` and `/announcements/{id}/edit` | View |
| `app/hello/route.ts` | `GET /hello` — returns plain text `Hello, World!` | Controller (no Model) |
| `app/hello/[name]/route.ts` | `GET /hello/{name}` — reads the `name` URL parameter, returns `Hello, {name}!` | Controller (no Model) |
| `app/sum/[number1]/[number2]/route.ts` | `GET /sum/{a}/{b}` — validates two URL parameters as numbers and returns their sum, or a 400 error | Controller (no Model) |
| `app/api/health/route.ts` | `GET /api/health` — returns `{ "status": "ok" }` | Controller (no Model) |
| `app/api/users/route.ts` | `GET` and `POST` handlers, each a one-line call to `ApiUserController.getAll` / `create` | Route → Controller |
| `app/api/users/[id]/route.ts` | `GET`, `PUT`, `PATCH`, `DELETE` handlers, each a one-line call to `ApiUserController.getById` / `replace` / `update` / `delete` | Route → Controller |
| `app/api/announcements/route.ts` | `GET` and `POST` handlers, each a one-line call to `ApiAnnouncementController.getAll` / `create` | Route → Controller |
| `app/api/announcements/[id]/route.ts` | `GET`, `PUT`, `PATCH`, `DELETE` handlers, each a one-line call to `ApiAnnouncementController.getById` / `replace` / `update` / `delete` | Route → Controller |
| `app/api/swagger/page.tsx` | `GET /api/swagger` — page that hands the OpenAPI spec to Swagger UI | View |
| `app/api/swagger/SwaggerView.tsx` | Client component that loads `swagger-ui-dist` in the browser and draws the docs | View |
| `lib/controllers/ApiUserController.ts` | API-side user controller: `create`, `getAll`, `getById`, `replace`, `update`, `delete`. Reads form-data from the `Request`, validates it, calls the User Model and returns `NextResponse.json(...)` with 200 / 201 / 400 / 404 | Controller |
| `lib/controllers/UserController.ts` | Page-side user controller: `create`, `getAll`, `getById`, `update`, `delete`. Takes plain arguments and returns `{ user }`, `{ users }`, `{ id }` or `{ error }` — no `Request` / `NextResponse`. Also exports the shared `name` validation rule | Controller |
| `lib/controllers/ApiAnnouncementController.ts` | API-side announcement controller: `create`, `getAll`, `getById`, `replace`, `update`, `delete`. Reads form-data from the `Request`, validates it (`title` and `content` required), calls the Announcement Model and returns `NextResponse.json(...)` — 200 / 201, 400 for a bad body or an id that isn't a whole number, 404 if not found. Used by the `/api/announcements` routes | Controller |
| `lib/controllers/AnnouncementController.ts` | Page-side announcement controller: `create`, `getAll`, `getById`, `update`, `delete`. Takes plain arguments and returns `{ announcement }`, `{ announcements }`, `{ id }` or `{ error }` — no `Request` / `NextResponse`. Also exports the shared validation rule (`validateAnnouncement`) and id check (`parseId`). Used by the `/announcements` pages | Controller |
| `lib/views/users/UserListView.tsx` | Receives `users` and the delete action as props and renders the table (id, name, email, department, age) with **View**, **Edit** and **Delete** for each row; shows a short message when the list is empty | View |
| `lib/views/users/UserDetailView.tsx` | Receives one `user` and the delete action; shows every field, an **Edit** link, a **Delete** button and a link back to the list | View |
| `lib/views/users/UserCreateForm.tsx` | Receives the Server Action as a prop and renders the form (name required, email, age). Shows the action's validation error or success message, keeps typed values after an error, and disables the button while saving. A Client Component only because React's `useActionState` runs in the browser | View |
| `lib/views/users/UserEditForm.tsx` | Same fields as the create form, pre-filled with the user's current values; shows the update action's validation error and keeps what was typed. Client Component (`useActionState`) | View |
| `lib/views/users/DeleteUserButton.tsx` | A small form with a **Delete** button: asks "Delete user …?" in the browser, runs the delete action, and shows its error (e.g. the user was already deleted). Client Component (confirmation + `useActionState`) | View |
| `lib/views/announcements/AnnouncementListView.tsx` | Receives `announcements` and the delete action; renders a table (title, author, date) with **View**, **Edit** and **Delete** for each row; shows a short message when the list is empty | View |
| `lib/views/announcements/AnnouncementDetailView.tsx` | Receives one `announcement` and the delete action; shows the title, author, posted / updated dates and full content, an **Edit** link, a **Delete** button and a link back to the list | View |
| `lib/views/announcements/AnnouncementCreateForm.tsx` | Form with title (required), content (required, a textarea) and author. Shows the create action's validation error or success message and keeps typed values after an error. Client Component (`useActionState`) | View |
| `lib/views/announcements/AnnouncementEditForm.tsx` | Same fields, pre-filled with the announcement's current values; shows the update action's validation error. Client Component (`useActionState`) | View |
| `lib/views/announcements/DeleteAnnouncementButton.tsx` | A small form with a **Delete** button: asks "Delete announcement …?" in the browser, runs the delete action, and shows its error (e.g. already deleted). Client Component | View |
| `lib/views/announcements/formatDate.ts` | Formats an ISO date for display (e.g. `10/10/2026, 15:24:58 UTC`) | View (helper) |
| `lib/db.ts` | One shared `pg` connection pool, created lazily on the first query (so `npm run build` works without a database) and cached on `globalThis` (so dev hot reloads reuse it), plus the `query(text, params)` helper the Models use. Throws a clear error if `DATABASE_URL` is missing, and never logs the connection string | Model (data access) |
| `lib/controllers/databaseErrors.ts` | Maps PostgreSQL error codes (e.g. `23505` unique violation, `23503` foreign key, `23514` check, `22003` out of range) to clear 400 messages; anything else becomes `500 {"error": "Internal server error"}` (API) or a friendly message (pages), logged on the server | Controller (helper) |
| `lib/models/user.ts` | The User Model: `User` type and async CRUD functions `createUser`, `getAllUsers`, `getUserById`, `replaceUser`, `updateUser`, `deleteUser` in plain, parameterized SQL on the `users` table. `name`, `email`, `age`, `department` go to their columns, every other field to the `extra` jsonb column; users are returned flat, as before. No `Request` or `NextResponse` | Model |
| `lib/models/announcement.ts` | The Announcement Model: `Announcement` type and async CRUD functions `createAnnouncement`, `getAllAnnouncements` (newest first), `getAnnouncementById`, `replaceAnnouncement` (keeps `id` and `createdAt`), `updateAnnouncement`, `deleteAnnouncement` in plain, parameterized SQL on the `announcements` table. Every change sets `updated_at = now()`; dates are returned as ISO strings. No `Request` or `NextResponse` | Model |
| `lib/openapi.ts` | Hand-written OpenAPI 3 description of the `/api/*` routes, and the `/users` and `/announcements` pages and their Server Actions | Other (documentation) |
| `AGENTS.md`, `CLAUDE.md` | Instructions for AI coding assistants | Other |
| `package.json`, `package-lock.json` | Dependencies and npm scripts | Config |
| `next.config.ts`, `tsconfig.json`, `next-env.d.ts` | Next.js and TypeScript configuration | Config |
| `eslint.config.mjs`, `postcss.config.mjs` | Linting rules; Tailwind CSS via PostCSS | Config |

### Request flow example: `POST /api/users`

```
curl -X POST http://localhost:3000/api/users -F name=Ayman -F email=ayman@example.com
```

1. **Route** — Next.js matches the URL `/api/users` to `app/api/users/route.ts` and the method to its `POST` handler, which only calls `ApiUserController.create(request)`.
2. **Controller** — `create` in `lib/controllers/ApiUserController.ts` reads the form-data into a plain object, `{ name: "Ayman", email: "ayman@example.com" }`, and validates it:
   - Body isn't form-data → returns **400** `{ "error": "Request body must be form-data" }`
   - `name` missing or blank → returns **400** `{ "error": "\"name\" is required and must be a non-empty string" }`
3. **Model** — the controller calls `await createUser(fields)` in `lib/models/user.ts`, which runs one parameterized query through `lib/db.ts`:

   ```sql
   INSERT INTO users (name, email, age, department, extra)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, name, email, age, department, extra
   ```

   PostgreSQL assigns the `id`; the Model turns the returned row into the flat user object. If PostgreSQL rejects the data, the controller returns a clear **400**; any other database error becomes **500** `{ "error": "Internal server error" }`.
4. **View** — the controller returns the new user as JSON with `NextResponse.json(user, { status: 201 })`:

   ```json
   { "id": 1, "name": "Ayman", "email": "ayman@example.com" }
   ```

Because every user route and page reads from the same table, the new user is immediately visible at `GET /api/users/1`, at [`/users`](http://localhost:3000/users) (via `UserController.getAll()`), at `/users/1`, and in `psql` — and it is still there after a restart.

### Request flow example: creating a user from the form on `/users`

1. **View** — the browser shows `UserCreateForm` (rendered by `app/users/page.tsx`). The user types a name, email and age and clicks **Add user**.
2. **Server Action** — the browser sends `POST /users`, and Next.js runs `createUserAction` in `app/users/actions.ts` with the form data. The action only reads the three fields and calls `UserController.create({ name, email, age })`.
3. **Controller** — `await UserController.create(...)` checks that `name` isn't missing or blank (and that `age`, if filled in, is a whole number):
   - invalid → returns `{ error: "\"name\" is required and must be a non-empty string" }`, the action passes it back, and the form shows it in red (keeping what was typed)
   - valid → calls the Model
4. **Model** — `createUser(...)` in `lib/models/user.ts` inserts the row with `INSERT … RETURNING` — the same `users` table used by `/api/users`.
5. **View** — the action calls `revalidatePath("/users")` and returns `User "…" created with id …`. The form shows the message and clears, and the page re-renders: `UserController.getAll()` now includes the new user, and `UserListView` shows the new row — no full page reload. The user is also returned by `GET /api/users`.

### Current limitations

The code works, but a few things will change as the project grows:

- **Invalid ids are handled differently for users and announcements.** An id like `abc` gives **400** on `/api/announcements/{id}` but **404** on `/api/users/{id}`.
- **The page forms aren't a public API.** Create, update and delete on the pages are Server Actions, which Next.js only runs for requests carrying an action ID generated at build time, so they can't be called from Postman or Swagger's **Try it out** (`/api/users` and `/api/announcements` are the APIs for that). There is also no login check yet — anyone who can open `/users` or `/announcements` can add, edit or delete records.
- **The edit form only covers name, email and age.** Other fields (e.g. `department`) are kept but can only be changed through the API, and a field cleared in the form is saved as an empty string rather than removed.
- **No separate view layer for the API.** JSON responses and error messages are built inside `ApiUserController`, so for the API the controller and the view are the same code.
- **Validation lives in the controller layer, not the Model.** The "`name` is required" and "`age` must be a whole number" rules are defined once (in `UserController`, and reused by `ApiUserController`). The database enforces its own constraints too (`NOT NULL`, non-blank checks, `age >= 0`), which the controllers report as a 400.
- **Users' timestamps aren't shown.** The `users` table has `created_at` / `updated_at` (and `updated_at` is set on every change), but users are still returned in their old shape, without them.
- **API docs are separate from the code.** `lib/openapi.ts` is written by hand, so it has to be updated manually whenever a route changes (see [📘 API Documentation](#-api-documentation)).

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) with Docker Compose — to run the whole system with one command
- [Node.js](https://nodejs.org/) 20.9+ — only needed to run without Docker

### Run with Docker (recommended)

```bash
docker compose up --build
```

This starts three services, in this order:

1. **`db`** — the PostgreSQL 17 database where the app stores users and announcements.
2. **`migrate`** — once the database reports healthy, runs the [migrations](#-migrations) (creates any missing tables) and exits.
3. **`app`** — once the migrations succeeded, runs the app in **production mode** (`npm start`), connected to `db` through `DATABASE_URL`, at [http://localhost:3000](http://localhost:3000), with the API docs at [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger). The image is built with `npm ci` + `npm run build`; `migrate` uses the same image.

To stop everything and remove the containers:

```bash
docker compose down
```

The database files are kept in a **named volume** (`pgdata`), so they survive `docker compose down`. After the first build, `docker compose up` (without `--build`) starts everything again; add `--build` whenever the code has changed.

### Database service

The `db` service runs the official `postgres:17-alpine` image. The [migrations](#-migrations) create the `users` and `announcements` tables in it, and the app reads and writes them with plain SQL through `lib/db.ts`.

| Setting | Default value |
|---|---|
| Host (from your machine) | `localhost` |
| Host (from the app container) | `db` (the service name) |
| Port | `5432` |
| User | `alumni` |
| Password | `alumni_dev_password` |
| Database | `alumni` |
| `DATABASE_URL` (set for the app container) | `postgresql://alumni:alumni_dev_password@db:5432/alumni` |

These are **local development values only**. They work without any setup; to change them, copy `.env.example` to `.env` and edit it (`.env` is ignored by git).

Open a SQL prompt (`psql`) inside the running database:

```bash
docker compose exec db psql -U alumni -d alumni
```

You can also connect with a database tool (e.g. pgAdmin, DBeaver) to `localhost:5432`. If port 5432 is already in use on your machine, remove the `ports` lines of the `db` service in `docker-compose.yml`.

> ⚠️ **`docker compose down -v` deletes the database volume** — and with it every table and row. Use plain `docker compose down` to stop the system and keep the data.

### Run locally with `npm run dev` (for development)

The app needs the database, so start only the database (and its migrations) in Docker, and run the app on your machine:

```bash
# 1. Database settings for the app: DATABASE_URL must point to localhost:5432
cp .env.example .env

# 2. Start PostgreSQL and create the tables (the app container is not started)
docker compose up db migrate

# 3. In another terminal: install and run the app
npm install
npm run dev
```

Next.js reads `.env` automatically. The development server reloads when you edit files and is available at [http://localhost:3000](http://localhost:3000). Only one app can use port 3000 at a time, so stop the Docker `app` container (`docker compose stop app`) before `npm run dev`.

> **Note:** `npm run build` doesn't need a running database — pages and API routes that read data are rendered at request time, and the connection pool is only created on the first query.

### Useful commands

| Command | What it does |
|---|---|
| `docker compose up --build` | Builds and starts the database, runs the migrations, then starts the app |
| `docker compose down` | Stops everything and removes the containers (the database volume is kept) |
| `docker compose up db migrate` | Starts only the database and runs the migrations (for `npm run dev`) |
| `npm run dev` | Runs the app in development mode on your machine (needs the database, see above) |
| `npm run build` / `npm start` | Builds the app / runs the built app in production mode |
| `npm run lint` | Checks the code with ESLint |
| `npm run migrate` / `npm run migrate:down` | Applies pending [migrations](#-migrations) / rolls back the latest one |
| `npm run seed` / `npm run seed:fresh` | Inserts sample data if the tables are empty / deletes all users and announcements, then inserts it ([🌱 Factories and Seeding](#-factories-and-seeding)) |
| `docker compose --profile seed run --rm seed` | Seeds from Docker (add `npm run seed:fresh` at the end to reset) |
| `docker compose exec db psql -U alumni -d alumni` | Opens a SQL prompt in the database |

---

## 🧪 The Forgetting Test

This test checks what happens to the data when the app's container is removed and started again. It was first run in Week 5, **before** the database, to show why one was needed. It is kept here as history, followed by the same test with PostgreSQL.

**Procedure**

1. Start the system:
   ```bash
   docker compose up --build
   ```
2. Create a record — either send `POST /api/users` with form-data containing a `name`:
   ```bash
   curl -X POST http://localhost:3000/api/users -F name=Ayman
   ```
   or use the "Add a user" form at [http://localhost:3000/users](http://localhost:3000/users).
3. Check that the record is there:
   ```bash
   curl http://localhost:3000/api/users
   ```
4. Remove the containers:
   ```bash
   docker compose down
   ```
5. Start them again:
   ```bash
   docker compose up
   ```
6. Check `GET /api/users` again:
   ```bash
   curl http://localhost:3000/api/users
   ```

### Before: in-memory data (history)

**Expected result then:** the list was empty (`[]`). Users and announcements lived only in the app's memory — an in-memory array inside `lib/models/` — so they existed only as long as the app process was running. `docker compose down` removed the container, and with it everything in memory; `docker compose up` started a brand-new container with empty arrays. The `app` service has no volume, so nothing was saved to disk either.

**That is why the next step was a real database:** data that should survive restarts, updates and new deployments has to be stored outside the app's memory. The design for it is in [ddd.md](ddd.md).

**Result (in-memory version):** _(to be filled in after running the test)_

### Now: with PostgreSQL

**Expected result now:** the record is **still there** after `docker compose down` and `docker compose up`. The app keeps no data in memory any more: the Models store every user and announcement in PostgreSQL, and the database files live in the `pgdata` volume, which `docker compose down` keeps. (Only `docker compose down -v` deletes the volume — and then the data really is gone.)

**Result:** _(to be filled in after running the test)_

---

## 🧱 Migrations

A **migration** is a small, numbered SQL file that changes the database structure (e.g. creates a table). Running the migrations in order builds the same database on every machine, and each one has a matching "down" file that undoes it. They are plain SQL — no ORM.

**Folder layout**

```
migrations/
├── 001_create_users.up.sql            # change
├── 001_create_users.down.sql          # undo
├── 002_create_announcements.up.sql
└── 002_create_announcements.down.sql
```

The runner (`scripts/migrate.mjs`) records every applied migration by name (e.g. `001_create_users`) in a `schema_migrations` table, and runs each one inside a transaction, so a migration is applied completely or not at all. Running it again only applies what's new; if nothing is new it says **"No pending migrations."**

**Automatically with Docker** — `docker compose up` runs them for you: the `migrate` service waits for the database, applies any pending migrations, and exits; the app starts only after it succeeded. You can check the tables with:

```bash
docker compose exec db psql -U alumni -d alumni -c "\dt"
```

**By hand**

```bash
# inside Docker (database and runner both in containers)
docker compose run --rm migrate

# from your machine (needs the db running and DATABASE_URL, e.g. from .env: cp .env.example .env)
npm run migrate
```

**Roll back** the most recent migration (runs its `.down.sql` and removes it from `schema_migrations`):

```bash
npm run migrate:down
# or inside Docker:
docker compose run --rm migrate npm run migrate:down
```

Run it again to roll back one more. ⚠️ Rolling back a `create table` migration **deletes that table and its data**.

**Adding a new migration**

1. Take the next number, e.g. `003`, and a short name: `003_add_users_phone`.
2. Create `migrations/003_add_users_phone.up.sql` with the change, and `migrations/003_add_users_phone.down.sql` that undoes it.
3. Run `npm run migrate` (or `docker compose up --build`, so the new file is included in the image).

Never edit a migration that has already been applied — add a new one instead. The table design behind the migrations is in [ddd.md](ddd.md).

---

## 🌱 Factories and Seeding

A **factory** is a small function that builds one realistic sample record (e.g. a user) on demand, and a **seed** is a script that uses the factories to fill an empty database with sample data, so there is something to look at and test with. Like the migrations, it's plain SQL through `pg` — no ORM.

**Files**

```
scripts/
├── seed.mjs                       # inserts the sample data (one transaction, parameterized queries)
└── factories/
    ├── userFactory.mjs            # makeUser(overrides?), makeUsers(count, overrides?)
    └── announcementFactory.mjs    # makeAnnouncement(overrides?), makeAnnouncements(count, overrides?)
```

The factories only build plain objects — they never touch the database. Their values come from small built-in lists (Turkish names, departments, email domains, alumni-related titles), picked in order with a counter instead of randomly, so **every seed produces exactly the same data**. Emails contain the user's number, so they are unique.

**Seed the database** — inserts 10 users and 8 announcements:

```bash
# from Docker (the database must be running: docker compose up)
docker compose --profile seed run --rm seed

# from your machine (needs DATABASE_URL, e.g. from .env: cp .env.example .env)
npm run seed
```

The seed is **safe to run again**: if `users` or `announcements` already has rows, it changes nothing and prints *"Already seeded … Use --fresh to reset"*. It refuses to run when `NODE_ENV=production`, and tells you to run the migrations first if the tables don't exist yet. The `seed` service is in a Compose **profile**, so a normal `docker compose up` never seeds.

**Reset and seed again** with `--fresh`:

```bash
docker compose --profile seed run --rm seed npm run seed:fresh
# or
npm run seed:fresh
```

> ⚠️ **`--fresh` deletes ALL users and announcements** in the database (`TRUNCATE … RESTART IDENTITY`, so ids start at 1 again) before seeding. It never touches `schema_migrations` or drops any table.

After seeding, the sample users and announcements show up everywhere: on [`/users`](http://localhost:3000/users) and [`/announcements`](http://localhost:3000/announcements), in `GET /api/users` and `GET /api/announcements`, and in `psql`.

---

## 🗂️ Data Design

The [Data Design Documentation (ddd.md)](ddd.md) describes the data the app stores — the User and Announcement fields, their validation rules, ids and timestamps — the PostgreSQL tables the app now uses (created by the [migrations](#-migrations)), an ER diagram and the design decisions.

---

## 📘 API Documentation

Interactive **Swagger / OpenAPI** documentation for every API route is served at [`/api/swagger`](http://localhost:3000/api/swagger), with the user endpoints grouped under **API Users** and the announcement endpoints under **API Announcements**. From there you can browse each endpoint's request body and example responses, and send real requests to the running server with **Try it out**.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a user (form-data) |
| `GET` | `/api/users/{id}` | Get one user |
| `PUT` | `/api/users/{id}` | Replace a user (form-data) |
| `PATCH` | `/api/users/{id}` | Update some fields of a user (form-data) |
| `DELETE` | `/api/users/{id}` | Delete a user |
| `GET` | `/api/announcements` | List all announcements, newest first |
| `POST` | `/api/announcements` | Create an announcement (form-data: `title`, `content` required; `author` optional) |
| `GET` | `/api/announcements/{id}` | Get one announcement |
| `PUT` | `/api/announcements/{id}` | Replace an announcement (form-data) |
| `PATCH` | `/api/announcements/{id}` | Update some fields of an announcement (form-data) |
| `DELETE` | `/api/announcements/{id}` | Delete an announcement |

The same users can also be browsed as HTML pages, documented in Swagger under **Users (pages)**:

| Method | Route | Description |
|---|---|---|
| `GET` | `/users` | Page with the "Add a user" form and the list of all users |
| `POST` | `/users` | Sent by the "Add a user" form or a row's Delete button (Next.js Server Actions) — browser only |
| `GET` | `/users/{id}` | Page showing one user, or a "User not found" page (404) |
| `POST` | `/users/{id}` | Sent by the Delete button on that page (Server Action) — browser only |
| `GET` | `/users/{id}/edit` | Edit form, pre-filled, or a "User not found" page (404) |
| `POST` | `/users/{id}/edit` | Sent by the edit form (Server Action) — browser only |

The `POST` rows are browser form submissions handled by Server Actions, not REST endpoints — from Postman or scripts, use the `/api/users` routes above.

Announcements can also be managed as HTML pages, documented in Swagger under **Announcements (pages)**:

| Method | Route | Description |
|---|---|---|
| `GET` | `/announcements` | Page with the "Add an announcement" form and the list of all announcements, newest first |
| `POST` | `/announcements` | Sent by the "Add an announcement" form or a row's Delete button (Server Actions) — browser only |
| `GET` | `/announcements/{id}` | Page showing one announcement, or an "Announcement not found" page (404) |
| `POST` | `/announcements/{id}` | Sent by the Delete button on that page (Server Action) — browser only |
| `GET` | `/announcements/{id}/edit` | Edit form, pre-filled, or an "Announcement not found" page (404) |
| `POST` | `/announcements/{id}/edit` | Sent by the edit form (Server Action) — browser only |

As with users, the `POST` rows are Server Actions, not REST endpoints — from Postman or scripts, use the `/api/announcements` routes.

The OpenAPI spec is written by hand in [`lib/openapi.ts`](lib/openapi.ts) and rendered with [`swagger-ui-dist`](https://www.npmjs.com/package/swagger-ui-dist).

> **Keeping the docs accurate:** When adding or changing any API route, update its Swagger/OpenAPI documentation (the spec in `lib/openapi.ts`) in the same commit, so the docs stay accurate. AI coding assistants working on this repo should read this README and check the existing Swagger spec before adding or modifying API routes.

---

## 👤 Author

**Ayman**
MIS Student · Istanbul University · 📍 Istanbul, Turkey

---

## 📄 License

This project is developed for academic purposes. License to be determined if/when adopted for production use.
