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
| Database & Auth (planned) | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Containerization (planned) | Docker |
| Version Control | Git + GitHub |
| Deployment (planned) | TBD |

---

## ✨ Features

This project is being built incrementally over the semester. Status is updated weekly.

- [x] **Week 2 — Routing** — static pages (`/`, `/about`), plain-text route handlers (`/hello`), and dynamic routes that read URL parameters (`/hello/[name]`, `/sum/[number1]/[number2]`)
- [x] **Week 3 — REST API** — full CRUD for users under `/api/users` (`GET`, `POST`, and `GET` / `PUT` / `PATCH` / `DELETE` by id), a health check at `/api/health`, and interactive Swagger docs at `/api/swagger` (users are kept in memory for now)
- [ ] **Database** — replace the in-memory user store with Supabase (PostgreSQL)
- [ ] **Docker** — run the whole system with a single `docker compose up`

---

## 📂 Project Structure

```
alumni/
├── app/                              # Next.js App Router — every folder is a URL segment
│   ├── layout.tsx                    # Root layout shared by all pages
│   ├── globals.css                   # Global styles (Tailwind CSS)
│   ├── favicon.ico                   # Browser tab icon
│   ├── page.tsx                      # /                   temporary homepage
│   ├── about/page.tsx                # /about              temporary about page
│   ├── users/
│   │   ├── page.tsx                  # GET /users          user list + "Add a user" form  → UserController
│   │   ├── actions.ts                # Server Actions      create, update, delete         → UserController
│   │   └── [id]/
│   │       ├── page.tsx              # GET /users/{id}     one user's profile (HTML)      → UserController
│   │       ├── not-found.tsx         #                     "User not found" page (404)
│   │       └── edit/
│   │           └── page.tsx          # GET /users/{id}/edit  edit form (HTML)             → UserController
│   ├── hello/
│   │   ├── route.ts                  # /hello              "Hello, World!"
│   │   └── [name]/route.ts           # /hello/{name}       "Hello, {name}!"
│   ├── sum/[number1]/[number2]/
│   │   └── route.ts                  # /sum/{a}/{b}        sum of two numbers
│   └── api/
│       ├── health/route.ts           # /api/health         health check
│       ├── users/route.ts            # /api/users          list & create users (JSON)     → ApiUserController
│       ├── users/[id]/route.ts       # /api/users/{id}     get, replace, update, delete   → ApiUserController
│       └── swagger/
│           ├── page.tsx              # /api/swagger        interactive API docs
│           └── SwaggerView.tsx       # Client component that renders Swagger UI
├── lib/
│   ├── controllers/
│   │   ├── ApiUserController.ts      # User CRUD for the JSON API: Request in, NextResponse.json out
│   │   └── UserController.ts         # User CRUD for pages: plain arguments in, { user } / { error } out
│   ├── models/
│   │   └── user.ts                   # User Model: the only in-memory user store + CRUD functions
│   ├── views/
│   │   └── users/
│   │       ├── UserListView.tsx      # Table of users with View / Edit / Delete (markup only)
│   │       ├── UserDetailView.tsx    # One user's fields + Edit / Delete (markup only)
│   │       ├── UserCreateForm.tsx    # "Add a user" form: name*, email, age (markup only)
│   │       ├── UserEditForm.tsx      # "Edit user" form, pre-filled (markup only)
│   │       └── DeleteUserButton.tsx  # Delete button that asks for confirmation (markup only)
│   └── openapi.ts                    # OpenAPI spec rendered at /api/swagger
├── AGENTS.md                         # Instructions for AI coding assistants
├── CLAUDE.md                         # Points Claude Code at AGENTS.md
├── package.json                      # Dependencies & npm scripts (dev, build, start, lint)
├── package-lock.json                 # Exact installed dependency versions
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration (`@/` import alias)
├── next-env.d.ts                     # Next.js TypeScript types (auto-generated)
├── eslint.config.mjs                 # Linting rules
├── postcss.config.mjs                # Loads Tailwind CSS
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
Route / Page / Server Action  →  Controller  →  Model
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

| MVC role | In this project | Notes |
|---|---|---|
| **Model** | `lib/models/user.ts` — the User Model: the one in-memory user store and CRUD functions (`createUser`, `getAllUsers`, `getUserById`, `replaceUser`, `updateUser`, `deleteUser`) | No HTTP or Next.js code, so it can later be swapped for a database without touching the controllers. No database yet, so data is lost on every server restart. |
| **Controller** | `lib/controllers/ApiUserController.ts` and `lib/controllers/UserController.ts`, plus the `route.ts` files, pages and Server Actions that call them | Validation and request handling live in the controllers. The user `route.ts` files, the `app/users/` pages and `app/users/actions.ts` are thin: they call the matching controller function and pass the result on. |
| **View** | `lib/views/users/` (`UserListView`, `UserDetailView`, `UserCreateForm`, `UserEditForm`, `DeleteUserButton`), `page.tsx` files and `layout.tsx`, plus the JSON bodies the API returns | The components in `lib/views/` contain only markup and Tailwind classes: they get data and Server Actions through props and never call a controller or the Model. The `app/users/` pages fetch the data from `UserController` and hand it to the views. For the API there is no separate view file — `NextResponse.json(...)` in `ApiUserController` *is* the view. |

The mapping is loose in a few places. Next.js itself does the job of a router/front controller (matching a URL to a file), and `/hello`, `/sum` and `/api/health` are small `route.ts` files that do their own work without a Model.

**Two user controllers, one Model.** `ApiUserController` is for the JSON API: its functions take the `Request` (and route params), call the Model, and return `NextResponse.json(...)` with the right status code (201, 400, 404). `UserController` is for pages: its functions take plain arguments and return plain objects like `{ user }` or `{ error }` that a `page.tsx` can render, with no HTTP code at all. Both use the same validation rule (`name` is required) and the same User Model, so the API and the pages always show the same data — a user created with `POST /api/users` appears at `/users`, and a user created with the form on `/users` appears at `GET /api/users`.

**Why Server Actions for the page forms?** Next.js can't have a `page.tsx` and a `route.ts` for the same URL, so the `/users` pages can't have normal `POST` / `PUT` / `DELETE` route handlers. Instead, each form's `action` is a **Server Action** (`app/users/actions.ts`, marked `"use server"`): when the form is submitted, the browser sends a `POST` to the page it's on and Next.js runs that function on the server. The edit form and the Delete buttons attach the user's id with `action.bind(null, userId)`, as the Next.js forms guide recommends.

### All user routes

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
│   ├── hello/route.ts                [Controller]  /hello
│   ├── hello/[name]/route.ts         [Controller]  /hello/{name}
│   ├── sum/[number1]/[number2]/route.ts  [Controller]  /sum/{a}/{b}
│   └── api/
│       ├── health/route.ts           [Controller]  /api/health
│       ├── users/route.ts            [Route]       /api/users      → ApiUserController
│       ├── users/[id]/route.ts       [Route]       /api/users/{id} → ApiUserController
│       └── swagger/
│           ├── page.tsx              [View]        /api/swagger
│           └── SwaggerView.tsx       [View]        Swagger UI component
├── lib/
│   ├── controllers/
│   │   ├── ApiUserController.ts      [Controller]  user CRUD for the JSON API
│   │   └── UserController.ts         [Controller]  user CRUD for pages
│   ├── models/user.ts                [Model]       the user store + CRUD functions
│   ├── views/users/UserListView.tsx  [View]        table of users
│   ├── views/users/UserDetailView.tsx  [View]      one user
│   ├── views/users/UserCreateForm.tsx  [View]      "Add a user" form
│   ├── views/users/UserEditForm.tsx  [View]        "Edit user" form
│   ├── views/users/DeleteUserButton.tsx  [View]    Delete button with confirmation
│   └── openapi.ts                    [Other]       API documentation (OpenAPI spec)
└── config files                      [Config]      package.json, next.config.ts, tsconfig.json, …
```

| File / folder | What it does | MVC role |
|---|---|---|
| `app/` | All routes. Each folder is a URL segment; `page.tsx` = a page, `route.ts` = an API endpoint | — (routing) |
| `app/layout.tsx` | Root `<html>`/`<body>` wrapper, fonts and page metadata shared by every page | View |
| `app/globals.css` | Tailwind CSS import and global colours / fonts | View |
| `app/favicon.ico` | Browser tab icon | View |
| `app/page.tsx` | `GET /` — temporary homepage | View |
| `app/about/page.tsx` | `GET /about` — temporary about page | View |
| `app/users/page.tsx` | `GET /users` — calls `UserController.getAll()` and renders `UserCreateForm` above `UserListView`. Renders on every request (`connection()`), so new users always show | Page (Route → Controller → View) |
| `app/users/actions.ts` | The three Server Actions behind the page forms. `createUserAction` → `UserController.create`, returns the error or a success message. `updateUserAction` → `UserController.update`, returns the error or redirects to `/users/{id}`. `deleteUserAction` → `UserController.delete`, returns "not found" or redirects to `/users`. Each calls `revalidatePath` after a change | Controller entry points (Server Actions) |
| `app/users/[id]/page.tsx` | `GET /users/{id}` — calls `UserController.getById(id)` and renders `UserDetailView`; unknown id → `notFound()` | Page (Route → Controller → View) |
| `app/users/[id]/edit/page.tsx` | `GET /users/{id}/edit` — calls `UserController.getById(id)` and renders `UserEditForm`; unknown id → `notFound()` | Page (Route → Controller → View) |
| `app/users/[id]/not-found.tsx` | The "User not found" page, returned with HTTP 404 for `/users/{id}` and `/users/{id}/edit` | View |
| `app/hello/route.ts` | `GET /hello` — returns plain text `Hello, World!` | Controller (no Model) |
| `app/hello/[name]/route.ts` | `GET /hello/{name}` — reads the `name` URL parameter, returns `Hello, {name}!` | Controller (no Model) |
| `app/sum/[number1]/[number2]/route.ts` | `GET /sum/{a}/{b}` — validates two URL parameters as numbers and returns their sum, or a 400 error | Controller (no Model) |
| `app/api/health/route.ts` | `GET /api/health` — returns `{ "status": "ok" }` | Controller (no Model) |
| `app/api/users/route.ts` | `GET` and `POST` handlers, each a one-line call to `ApiUserController.getAll` / `create` | Route → Controller |
| `app/api/users/[id]/route.ts` | `GET`, `PUT`, `PATCH`, `DELETE` handlers, each a one-line call to `ApiUserController.getById` / `replace` / `update` / `delete` | Route → Controller |
| `app/api/swagger/page.tsx` | `GET /api/swagger` — page that hands the OpenAPI spec to Swagger UI | View |
| `app/api/swagger/SwaggerView.tsx` | Client component that loads `swagger-ui-dist` in the browser and draws the docs | View |
| `lib/controllers/ApiUserController.ts` | API-side user controller: `create`, `getAll`, `getById`, `replace`, `update`, `delete`. Reads form-data from the `Request`, validates it, calls the User Model and returns `NextResponse.json(...)` with 200 / 201 / 400 / 404 | Controller |
| `lib/controllers/UserController.ts` | Page-side user controller: `create`, `getAll`, `getById`, `update`, `delete`. Takes plain arguments and returns `{ user }`, `{ users }`, `{ id }` or `{ error }` — no `Request` / `NextResponse`. Also exports the shared `name` validation rule | Controller |
| `lib/views/users/UserListView.tsx` | Receives `users` and the delete action as props and renders the table (id, name, email, department, age) with **View**, **Edit** and **Delete** for each row; shows a short message when the list is empty | View |
| `lib/views/users/UserDetailView.tsx` | Receives one `user` and the delete action; shows every field, an **Edit** link, a **Delete** button and a link back to the list | View |
| `lib/views/users/UserCreateForm.tsx` | Receives the Server Action as a prop and renders the form (name required, email, age). Shows the action's validation error or success message, keeps typed values after an error, and disables the button while saving. A Client Component only because React's `useActionState` runs in the browser | View |
| `lib/views/users/UserEditForm.tsx` | Same fields as the create form, pre-filled with the user's current values; shows the update action's validation error and keeps what was typed. Client Component (`useActionState`) | View |
| `lib/views/users/DeleteUserButton.tsx` | A small form with a **Delete** button: asks "Delete user …?" in the browser, runs the delete action, and shows its error (e.g. the user was already deleted). Client Component (confirmation + `useActionState`) | View |
| `lib/models/user.ts` | The User Model: `User` type, the in-memory user store (array + an id counter that never reuses ids), and the CRUD functions `createUser`, `getAllUsers`, `getUserById`, `replaceUser`, `updateUser`, `deleteUser`. Pure data code — no `Request` or `NextResponse` | Model |
| `lib/openapi.ts` | Hand-written OpenAPI 3 description of the `/api/*` routes, the `/users` pages and their Server Actions | Other (documentation) |
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
3. **Model** — the controller calls `createUser(fields)` in `lib/models/user.ts`, which gives the user the next id and stores it in the in-memory user store.
4. **View** — the controller returns the new user as JSON with `NextResponse.json(user, { status: 201 })`:

   ```json
   { "id": 1, "name": "Ayman", "email": "ayman@example.com" }
   ```

Because every user route and page reads from the same Model, the new user is immediately visible at `GET /api/users/1`, at [`/users`](http://localhost:3000/users) (via `UserController.getAll()`), and at `/users/1`.

### Request flow example: creating a user from the form on `/users`

1. **View** — the browser shows `UserCreateForm` (rendered by `app/users/page.tsx`). The user types a name, email and age and clicks **Add user**.
2. **Server Action** — the browser sends `POST /users`, and Next.js runs `createUserAction` in `app/users/actions.ts` with the form data. The action only reads the three fields and calls `UserController.create({ name, email, age })`.
3. **Controller** — `UserController.create` checks that `name` isn't missing or blank:
   - invalid → returns `{ error: "\"name\" is required and must be a non-empty string" }`, the action passes it back, and the form shows it in red (keeping what was typed)
   - valid → calls the Model
4. **Model** — `createUser(...)` in `lib/models/user.ts` gives the user the next id and stores it — the same store used by `/api/users`.
5. **View** — the action calls `revalidatePath("/users")` and returns `User "…" created with id …`. The form shows the message and clears, and the page re-renders: `UserController.getAll()` now includes the new user, and `UserListView` shows the new row — no full page reload. The user is also returned by `GET /api/users`.

### Current limitations

The code works, but a few things will change as the project grows (most likely when the in-memory store is replaced by Supabase):

- **Data isn't persistent.** The Model keeps users in memory, so they all disappear when the server restarts. The store is kept on `globalThis` because Next.js loads `lib/models/user.ts` separately for API routes and for pages — without that, `/api/users` and `/users` would each have their own copy. A database removes this workaround.
- **The page forms aren't a public API.** Create, update and delete on the pages are Server Actions, which Next.js only runs for requests carrying an action ID generated at build time, so they can't be called from Postman or Swagger's **Try it out** (`/api/users` is the API for that). There is also no login check yet — anyone who can open `/users` can add, edit or delete users.
- **The edit form only covers name, email and age.** Other fields (e.g. `department`) are kept but can only be changed through the API, and a field cleared in the form is saved as an empty string rather than removed.
- **No separate view layer for the API.** JSON responses and error messages are built inside `ApiUserController`, so for the API the controller and the view are the same code.
- **Validation lives in the controller layer, not the Model.** The "`name` is required" rule is defined once (in `UserController`, and reused by `ApiUserController`), but the Model itself accepts any data it's given.
- **API docs are separate from the code.** `lib/openapi.ts` is written by hand, so it has to be updated manually whenever a route changes (see [📘 API Documentation](#-api-documentation)).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 20+

### Run locally

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000), and the API docs at [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger).

*(Docker and Supabase setup — environment variables and `docker compose up` — will be added here once they're part of the project.)*

---

## 📘 API Documentation

Interactive **Swagger / OpenAPI** documentation for every API route is served at [`/api/swagger`](http://localhost:3000/api/swagger), with the user endpoints grouped under **API Users**. From there you can browse each endpoint's request body and example responses, and send real requests to the running server with **Try it out**.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a user (form-data) |
| `GET` | `/api/users/{id}` | Get one user |
| `PUT` | `/api/users/{id}` | Replace a user (form-data) |
| `PATCH` | `/api/users/{id}` | Update some fields of a user (form-data) |
| `DELETE` | `/api/users/{id}` | Delete a user |

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

The OpenAPI spec is written by hand in [`lib/openapi.ts`](lib/openapi.ts) and rendered with [`swagger-ui-dist`](https://www.npmjs.com/package/swagger-ui-dist).

> **Keeping the docs accurate:** When adding or changing any API route, update its Swagger/OpenAPI documentation (the spec in `lib/openapi.ts`) in the same commit, so the docs stay accurate. AI coding assistants working on this repo should read this README and check the existing Swagger spec before adding or modifying API routes.

---

## 👤 Author

**Ayman**
MIS Student · Istanbul University · 📍 Istanbul, Turkey

---

## 📄 License

This project is developed for academic purposes. License to be determined if/when adopted for production use.
