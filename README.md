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
├── app/                        # Next.js App Router — every folder is a URL segment
│   ├── page.tsx                # /                       temporary homepage
│   ├── about/page.tsx          # /about                  temporary about page
│   ├── hello/
│   │   ├── route.ts            # /hello                  "Hello, World!"
│   │   └── [name]/route.ts     # /hello/{name}           "Hello, {name}!"
│   ├── sum/[number1]/[number2]/
│   │   └── route.ts            # /sum/{a}/{b}            sum of two numbers
│   ├── api/
│   │   ├── health/route.ts     # /api/health             health check
│   │   ├── users/route.ts      # /api/users              list & create users
│   │   ├── users/[id]/route.ts # /api/users/{id}         get, replace, update, delete a user
│   │   └── swagger/page.tsx    # /api/swagger            interactive API docs
│   ├── layout.tsx              # Root layout shared by all pages
│   └── globals.css             # Global styles (Tailwind CSS)
├── lib/
│   ├── users.ts                # In-memory user store shared by the /api/users routes
│   └── openapi.ts              # OpenAPI spec rendered at /api/swagger
├── AGENTS.md                   # Instructions for AI coding assistants
└── README.md
```

*(Structure will evolve as the project grows — this section is kept up to date.)*

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

Interactive **Swagger / OpenAPI** documentation for every API route is served at [`/api/swagger`](http://localhost:3000/api/swagger). From there you can browse each endpoint's request body and example responses, and send real requests to the running server with **Try it out**.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a user (form-data) |
| `GET` | `/api/users/{id}` | Get one user |
| `PUT` | `/api/users/{id}` | Replace a user (form-data) |
| `PATCH` | `/api/users/{id}` | Update some fields of a user (form-data) |
| `DELETE` | `/api/users/{id}` | Delete a user |

The OpenAPI spec is written by hand in [`lib/openapi.ts`](lib/openapi.ts) and rendered with [`swagger-ui-dist`](https://www.npmjs.com/package/swagger-ui-dist).

> **Keeping the docs accurate:** When adding or changing any API route, update its Swagger/OpenAPI documentation (the spec in `lib/openapi.ts`) in the same commit, so the docs stay accurate. AI coding assistants working on this repo should read this README and check the existing Swagger spec before adding or modifying API routes.

---

## 👤 Author

**Ayman**
MIS Student · Istanbul University · 📍 Istanbul, Turkey

---

## 📄 License

This project is developed for academic purposes. License to be determined if/when adopted for production use.
