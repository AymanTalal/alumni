# 🗂️ Data Design Documentation

> Part of the **Alumni Tracking System** — back to the [README](README.md).

---

## 🎯 Purpose

This document describes the data the app works with, the rules the code enforces, and how it is stored in PostgreSQL. The app first kept everything in memory, so — as [🧪 The Forgetting Test](README.md#-the-forgetting-test) showed — all data disappeared whenever the server restarted or the Docker container was removed. This design prepared the move to a real database, and it is now **implemented**: the tables are created by the migrations in `migrations/`, and the Models in `lib/models/` read and write them with **plain, parameterized SQL** through `lib/db.ts` (the `pg` driver, no ORM). The data now survives restarts and `docker compose down`.

The next table, **`job_postings`**, was **designed here first** ("design first, then the code") and is **created by migration `003_create_job_postings`**, with its **Model and rules in `lib/models/jobPosting.ts`**, a **JSON API**, and **pages** at `/jobs` (✅ implemented).

> **Design change — partly implemented (the professor's whiteboard design).** Users and job postings are linked **only through the `applications` join table** — a **many-to-many** relationship. There is **no direct owner**: the `job_postings.user_id` column was **removed by migration `004_drop_job_postings_user_id`**, and the job-posting code was updated to match (✅ both implemented — job postings are created with `POST /api/jobs`, without any user). The **`applications` table** is created by **migration `005_create_applications`**, with its **Model and rules in `lib/models/application.ts`** and its **JSON API** in `ApiApplicationController` (✅ all implemented); the include is still **planned**. A user's **"jobs"** are the job postings linked to that user through `applications`, and `GET /api/users/{id}` will be able to include them (like `User.find(1, { include: "jobs" })`). **Planned — not implemented yet (Week 7 design):** job postings get new columns (`city`, `description`, `employment_type`, `status`, `deadline`), stricter rules (a required `company`, length limits) that the database also enforces, a 400 answer that lists every broken field, and no applications to a **closed** posting — see [Job posting rules (planned)](#job-posting-rules-planned) and the [planned columns](#-job_postings--implemented-planned-change-new-columns-and-rules). See the [relationship](#users--job-postings-many-to-many-through-applications), [💼 `job_postings`](#-job_postings--implemented-planned-change-new-columns-and-rules), [📝 `applications`](#-applications--implemented-migration-005), the [API](#-api-job-postings-and-applications) and the [🔧 changes needed in the code](#-changes-needed-in-the-code).

---

## 💾 Data in the app

All four current entities — **User**, **Announcement**, **JobPosting** and **Application** — are defined as TypeScript types in `lib/models/` and stored in PostgreSQL (tables `users`, `announcements`, `job_postings` and `applications`). The Models turn each table row into the object below — mapping `snake_case` columns to `camelCase` fields — so the controllers, views and API see the same shapes as before the database (with one change: `age` is now a number).

### User — `lib/models/user.ts`

| Field | TypeScript type | Required? | Description |
|---|---|---|---|
| `id` | `number` | Set by the database | Assigned by PostgreSQL (`GENERATED ALWAYS AS IDENTITY`). Clients can't choose it; an `id` sent in a request is ignored |
| `name` | `string` | **Required** | The user's name. Must be a non-empty string |
| `email` | `string` | Optional | Email address. Stored as sent — no format check on the server (the page form uses `type="email"`, which is only checked by the browser) |
| `age` | `number` | Optional | Age as a **whole number** (stored in an `integer` column). Sent as text in form-data (e.g. `"22"`) and checked by the controllers |
| `department` | `string` | Optional | Department, e.g. `"MIS"` |
| *any other key* | `string` | Optional | **Dynamic fields** — see below |

**Dynamic fields.** The `User` type has an index signature (`[field: string]: string | number | undefined`), so a user can carry **any extra field**. `POST /api/users`, `PUT` and `PATCH` accept *every* text field sent in the form-data (e.g. `city`). `name`, `email`, `age` and `department` go into their own columns; **every other field is stored in the `extra` jsonb column** (e.g. `{"city": "Istanbul"}`) and returned side by side with the columns, so a user looks exactly as flat as before. The pages only use `name`, `email` and `age` in their forms; other fields can only be set through the API, but are kept when a user is edited on the pages.

The `users` table also has `created_at` and `updated_at`, but they are **not returned** with the user (the API kept its old shape).

### Announcement — `lib/models/announcement.ts`

| Field | TypeScript type | Required? | Description |
|---|---|---|---|
| `id` | `number` | Set by the database | Assigned by PostgreSQL (`GENERATED ALWAYS AS IDENTITY`). Clients can't choose it |
| `title` | `string` | **Required** | Title. Must be a non-empty string |
| `content` | `string` | **Required** | Body text. Must be a non-empty string. Text typed in the page's textarea arrives with `\r\n` line breaks |
| `author` | `string` | Optional | **Free text** (e.g. `"Alumni Office"`) — not linked to a User |
| `createdAt` | `string` | Set by the database | ISO date string (e.g. `"2026-10-10T09:30:00.000Z"`) from the `created_at` column, set when the announcement is created |
| `updatedAt` | `string` | Set by the database | ISO date string from `updated_at`, set on create and refreshed on every replace or update |

Unlike users, announcements have a **fixed set of fields**: the Model only stores `title`, `content` and `author`, so any other field sent to the API is ignored.

### JobPosting — `lib/models/jobPosting.ts` (used by the job postings API)

| Field | TypeScript type | Required? | Description |
|---|---|---|---|
| `id` | `number` | Set by the database | Assigned by PostgreSQL (`GENERATED ALWAYS AS IDENTITY`). An `id` in the data is ignored |
| `title` | `string` | **Required** | The job title, **trimmed**; 1–200 characters |
| `company` | `string` | Optional | The hiring company, **trimmed**; at most 200 characters. Left out when empty (`NULL`) |
| `createdAt` | `string` | Set by the database | ISO date string from `created_at` |
| `updatedAt` | `string` | Set by the database | ISO date string from `updated_at`, refreshed on every update |

Like announcements, job postings have a **fixed set of fields**: only `title` and `company` are taken from the data; anything else (`id`, `userId`, `createdAt`, …) is ignored. **A job posting has no owner** (✅ implemented): there is no `userId` field and no `user_id` column.

> **Planned — not implemented yet:** the fields `city`, `description`, `employmentType`, `status` and `deadline` (from the planned columns `city`, `description`, `employment_type`, `status`, `deadline`), `company` becoming **required**, and new limits (`title` 3–120, `company` 1–120 characters). Optional fields with no value stay left out of the JSON, like `company` today; `deadline` is returned as a `"YYYY-MM-DD"` string. See [Job posting rules (planned)](#job-posting-rules-planned).

### Application — `lib/models/application.ts`

| Field | TypeScript type | Required? | Description |
|---|---|---|---|
| `id` | `number` | Set by the database | Assigned by PostgreSQL (`GENERATED ALWAYS AS IDENTITY`). An `id` in the data is ignored |
| `userId` | `number` | **Required** | The applicant (`users.id`). Fixed once the application exists |
| `jobPostingId` | `number` | **Required** | The job posting applied to (`job_postings.id`). Fixed once the application exists; the nested route takes it only from the URL |
| `status` | `string` | Optional (default `pending`) | `pending`, `accepted` or `rejected` — the only field that can change |
| `createdAt` | `string` | Set by the database | ISO date string from `created_at` (when the user applied) |
| `updatedAt` | `string` | Set by the database | ISO date string from `updated_at`, refreshed on every status change |

An application is the **join** between a user and a job posting (many-to-many, see [Relationships](#-relationships)); the pages also read it **joined** with the user's name and email and the posting's title and company. Its rules are in [Application — rules](#application--rules).

---

## 📏 Entities and rules

These are the rules the code enforces **now** (controllers + database constraints).

### User

- **Validation** (in `UserController`, used by both the page and API controllers):
  - Create (`POST /api/users`, the "Add a user" form) and replace (`PUT /api/users/{id}`): `name` is **required** and must be a non-empty string (a name of only spaces is rejected).
  - Partial update (`PATCH /api/users/{id}`, the edit form): `name` may be left out, but if it is sent it can't be blank.
  - `age`, if sent and not empty, must be a **whole number** (`0` or more) — needed since the column is an `integer`.
  - The database also checks `name` (`NOT NULL`, not blank) and `age >= 0`; if it ever rejects a value, the controllers answer **400** with a clear message instead of crashing.
- **What is stored:** values are stored **as sent** — the `trim()` check is only used for validation, so a name like `" Ayman "` keeps its spaces.
- **Empty optional fields:**
  - The "Add a user" form leaves empty fields out entirely (the columns stay `NULL`).
  - The edit form and `PATCH` store a cleared text field as an empty string `""`, as before; a cleared `age` becomes `NULL` (an integer column can't hold `""`).
  - `PUT` replaces the whole user: columns not sent become `NULL` and `extra` is replaced.
  - `NULL` columns are left out of the returned user, like fields that were never sent.
- **Ids:** assigned by PostgreSQL. Ids only go up and are **never reused**, even after a restart (the old in-memory counter restarted at 1). `--fresh` seeding resets them on purpose (`RESTART IDENTITY`). An id in a URL that isn't a whole number (`abc`, `1.5`) is answered with **404**, as before (job postings and applications answer **400** — to be made consistent in the validation task, question 10).
- **Timestamps:** `created_at` and `updated_at` exist in the table (`updated_at` is set to `now()` on every replace / update), but aren't returned.
- **Order:** `getAllUsers()` returns users oldest first (`ORDER BY id`), as before.
- **Uniqueness:** none — two users can have the same name or email (no unique constraint, see open question 6).

### Announcement

- **Validation** (in `AnnouncementController.validateAnnouncement`, used by both the page and API controllers):
  - Create (`POST /api/announcements`, the "Add an announcement" form) and replace (`PUT`): `title` **and** `content` are **required** and must be non-empty strings.
  - Partial update (`PATCH`, the edit form): `title` and `content` may be left out, but can't be blank if sent.
  - `author` is not validated. The database also checks `title` and `content` (`NOT NULL`, not blank).
- **What is stored:** values are stored as sent (not trimmed). Only `title`, `content` and `author` are kept.
- **Empty optional fields:** the create form leaves an empty `author` out (`NULL`); the edit form and `PATCH` store a cleared `author` as `""`; `PUT` sets `author` to `NULL` if it isn't sent.
- **Ids:** assigned by PostgreSQL, never reused. An id in a URL must be a whole number (`/^\d+$/`); otherwise the API answers **400** (users answer **404** for the same case — kept as before).
- **Timestamps:** `created_at` and `updated_at` default to `now()` in the database. `created_at` never changes; every replace and update sets `updated_at = now()` in its `UPDATE` query.
- **Order:** `getAllAnnouncements()` returns the newest first (`ORDER BY created_at DESC, id DESC`).

### JobPosting — rules

> Unlike users and announcements, whose rules live in the controllers, **the job posting rules live in the Model** (`lib/models/jobPosting.ts`), in one function — `validateJobPosting` — used by both create and update, so each rule exists once.
>
> These are the rules **implemented today**. They will be replaced by the [Job posting rules (planned)](#job-posting-rules-planned) below (Week 7 design, not implemented yet).

- **`title`:** required when creating. It must be text; it is **trimmed**, must not be empty after trimming, and can be at most **200** characters. On update it may be left out (it stays as it is), but if it is sent the same rules apply.
- **`company`:** optional. If sent it must be text; it is **trimmed** and can be at most **200** characters. An empty company (`""` or only spaces) means "no company" and is stored as `NULL`.
- **Valid ids only.** A posting id that isn't a whole number greater than 0 (`"abc"`, `"1.5"`, `-2`, `0`, or a number too large for an id) is reported as an invalid id — no query is run.
- **No owner** *(✅ implemented)*. The old rules "the user must exist" and "the owner never changes" are **gone** with the `user_id` column: creating a posting needs no user, and the `23503` (foreign key) handling was removed from the Model.
- **How problems are reported.** The Model returns a result instead of throwing, and `ApiJobPostingController` turns each result into an HTTP status (**implemented**):

  | Result | Meaning | HTTP response |
  |---|---|---|
  | `{ jobPosting }` / `{ jobPostings }` | Success | 200 (read, update) / 201 (create) |
  | `true` from `deleteJobPosting` | Deleted | **204**, no body |
  | `{ error: "validation", message }` | A rule above is broken, e.g. `"title" can't be empty` | 400 with that message |
  | `{ error: "invalid-id", message }` | The id can't match a row, e.g. `Job posting id "abc" is not a valid number` | 400 with that message |
  | `{ error: "not-found", message }` / `false` from delete | The posting doesn't exist | 404 `{"error": "not found", "reason": "No job posting with id …"}` (usually already answered by the [404 guard](#error-shapes-of-the-json-api)) |

  `deleteJobPosting` returns `true` (deleted) or `false` (not found), or an invalid-id result.
- **Database errors aren't swallowed.** The Model doesn't catch any other database error: it goes on to the **error handler** middleware, which logs it once and answers **503** `{"error": "service unavailable", "reason": "The database is not reachable. Try again later."}` if the database can't be reached, otherwise **500** `{"error": "internal error"}` (see [Error shapes](#error-shapes-of-the-json-api)).
- **Deleting a user no longer deletes job postings** *(✅ implemented by migration 004 — the `ON DELETE CASCADE` foreign key went with `user_id`)*. Since migration 005, deleting a user deletes only their applications (`ON DELETE CASCADE` on `applications.user_id`).
- **Order:** postings are listed newest first (`ORDER BY created_at DESC, id DESC`).

### Job posting rules (planned)

> **Planned — not implemented yet (Week 7 design).** `ddd.md` is the source of truth: the migration (`006`) and the code come in later tasks (see [🔧 Planned: job posting fields and rules](#planned-job-posting-fields-and-rules)). Until then, the [rules above](#jobposting--rules) are what the app does. Like today, the rules will live in **one place in the Model** (`validateJobPosting` in `lib/models/jobPosting.ts`), and the database will protect the same data a second time.

| # | Rule | Enforced in | What the API answers |
|---|---|---|---|
| 1 | **Text is trimmed.** Every text value has its surrounding spaces removed before it is checked and stored. A field with **only spaces counts as empty**. | Model (trims); database (its length checks use `btrim`, so a space-only value can't pass) | — (part of the other rules) |
| 2 | **Every field must be text** — `title`, `company`, `city`, `description`; `employment_type`, `status` and `deadline` are text in their own formats (rule 7). A number, `true`, a list or an object is refused. (Form-data always sends text, so this matters for JSON bodies.) | Model | **400** — that field gets e.g. `"must be text"` |
| 3 | **`title`: required, 3 to 120 characters** (after trimming). | Model and database (`NOT NULL`, `CHECK`) | **400** — e.g. `"title": "must be 3 to 120 characters"` |
| 4 | **`company`: required, at most 120 characters** (after trimming; required means at least 1). **A change:** today `company` is optional. | Model and database (`NOT NULL`, `CHECK`) | **400** — e.g. `"company": "is required"` |
| 5 | **`city`: optional, at most 80 characters.** An empty or space-only city is stored as **no value (`NULL`)**. | Model (empty → `NULL`); database (`CHECK`: `NULL` or 1–80 characters) | **400** — e.g. `"city": "can be at most 80 characters"` |
| 6 | **`description`: optional, at most 2000 characters, at least 10 when given.** An empty or space-only description is stored as **no value (`NULL`)**. | Model (empty → `NULL`); database (`CHECK`: `NULL` or 10–2000 characters) | **400** — e.g. `"description": "must be 10 to 2000 characters"` |
| 7 | **`employment_type`** accepts only `full-time`, `part-time`, `internship`, `contract` (default `full-time`). **`status`** accepts only `open`, `closed` (default `open`). Both are compared **exactly** after trimming (lower case). **`deadline`** is optional; when given it must be a **real date** written `YYYY-MM-DD` (`2027-02-30` is refused) and **not in the past** — "today" is the date in **Istanbul time (`Europe/Istanbul`)** (✅ confirmed, question 33). The deadline is checked **only when it is set or changed** (see below); an update may **not** set a past deadline (✅ confirmed, question 32). | `employment_type`, `status`: model and database (`CHECK`). `deadline` format: model and database (the `date` type). "Not in the past": **model only** — a `CHECK` can't compare with today's date reliably (it would only be checked on insert / update, and an old row would become "invalid" just by time passing) | **400** — e.g. `"status": "must be one of: open, closed"`, `"deadline": "can't be in the past"` |
| 8 | **The 400 answer lists ALL broken fields at once**, not only the first, as `{ "error": "validation failed", "fields": { "title": "...", "company": "..." } }`. | Model (collects every problem) → controller (`ApiJobPostingController`, and the page controller for the forms) | **400** in that shape. ✅ **Confirmed as the target shape for ALL APIs** (question 35): it will be applied to every API through the **validation middleware** in a later Week 7 task. Until then, the other APIs keep `{ "error": "<message>" }`; a body that isn't JSON / form-data and an invalid id keep `{ "error": "…" }` too |
| 9 | **The database also protects the data:** `NOT NULL` on `title` and `company`, and `CHECK` constraints on the lengths, `employment_type` and `status`. Two layers: the Model gives **clear messages**; the database protects against bad data **from anywhere** (a script, `psql`, a bug). | Database (migration 006) | Should never happen through the API, because the Model checks first. If it does, the shared helper answers **400** (`23514` check, `23502` not null) as today |
| 10 | **Unknown fields are ignored:** `id`, `userId`, `createdAt`, `updatedAt` and anything else in the body. | Model (reads only the known fields) | — (like today) |

**When the rules apply.**

- **Create (`POST /api/jobs`, the `/jobs/new` form):** every rule. `title` and `company` must be sent; `employment_type` and `status` get their defaults (`full-time`, `open`) when left out; `city`, `description` and `deadline` may be left out. A `deadline` that is given must not be in the past.
- **Partial update (`PATCH /api/jobs/{id}`, the edit form):** **only the fields sent are checked**, and **the result must still be valid** — the Model merges the sent fields into the stored posting and the merged posting must pass the rules. So `title` and `company` can be changed but **not emptied**; sending an empty `city` or `description` clears it (`NULL`); sending an empty `deadline` clears it. **The deadline is checked only when it is set or changed:** if the sent `deadline` equals the stored one, the "not in the past" rule is skipped — needed because the edit form sends **every** field, so a posting whose deadline has passed can still have its title fixed.
- **Delete (`DELETE /api/jobs/{id}`, the Delete buttons):** **no rules** — only the usual valid-id check. Open and closed postings can both be deleted (their applications go with them, `ON DELETE CASCADE`).

**Closed postings.** `status: closed` stops **new applications** (see the [planned Application rule](#application--rules)); the posting itself can still be read, edited (also reopened with `status: open`) and deleted. **The deadline is informational only** (✅ confirmed, question 34): it never closes a posting by itself — **only `status: closed` blocks applications**.

**Considered and left out for now: no duplicate `title` + `company` + `city`.** A unique rule on these three would stop accidental double postings, but two real postings can share them (e.g. two "Backend Developer Intern" places at the same company and city in different terms), so it is not part of this design (open question 36).

### Application — rules

> ✅ **Implemented in the Model** (`lib/models/application.ts`), like the job posting rules: the data and its rules live in one place. ✅ **Routes implemented:** `ApiApplicationController` turns each result into the HTTP code below (see the [API](#-api-job-postings-and-applications)). ✅ **Pages implemented:** `ApplicationController` (page side) turns the same results into messages on `/jobs/{id}`, e.g. "User already applied to this job posting".

- **`userId` and `jobPostingId`:** both required when creating. Each must be a whole number greater than 0, sent as a number or as text (e.g. `3` or `"3"`). A missing one is a validation error; anything else that isn't a valid id (`"abc"`, `0`, `-2`, `1.5`) is reported as an **invalid id** — no query is run.
- **`status`:** optional when creating — it **defaults to `pending`**. If sent it must be **exactly** `pending`, `accepted` or `rejected` (no trimming, no capitals); anything else is a validation error. The list is `APPLICATION_STATUSES`, the same values as the table's `CHECK`.
- **Ignored fields:** only `userId`, `jobPostingId` and `status` are read; `id`, `createdAt`, `updatedAt` or anything else in the data is ignored.
- **The user and the job posting must exist**, and **a user can apply to a posting only once.** These are checked by the **database**, not by a query before the insert: the foreign keys reject a missing user or posting (`23503`) and `UNIQUE (user_id, job_posting_id)` rejects a second application (`23505`). The Model reads the **constraint name** of the error and turns it into a clear result. Because the database does the check, two requests at the same time can't create a duplicate (✅ verified: 5 parallel creates of the same pair gave 1 success and 4 "already applied").
- **Closed postings take no new applications** *(**Planned — not implemented yet**, Week 7 design)*. Applying to a job posting whose `status` is `closed` is refused with **409** `"Job posting is closed"`. The check belongs in the **same SQL statement as the insert** (e.g. `INSERT … SELECT … FROM job_postings WHERE id = $2 AND status = 'open'`), so a posting closed at the same moment can't slip through; when no row is inserted, the Model tells "not found" and "closed" apart. The **deadline is informational only**: a passed deadline does **not** refuse an application. Applications that already exist are not changed when a posting is closed (open question 37).
- **Only the status can change.** `updateApplicationStatus(id, status)` takes nothing else, and its SQL only sets `status` and `updated_at = now()`: the user and the job posting of an application are **fixed** once it is created.
- **Functions:** `createApplication({ userId, jobPostingId, status? })`, `getAllApplications()`, `getApplicationsByJobPostingId(jobPostingId)` (a posting's applicants), `getApplicationsByUserId(userId)` (what a user applied to), `getApplicationById(id)`, `updateApplicationStatus(id, status)`, `deleteApplication(id)`, and for the pages two **read-only joins** with no rules of their own: `getApplicationsWithUsersByJobPostingId(jobPostingId)` (each application with its applicant's `id`, `name`, `email`) and `getApplicationsWithJobPostingsByUserId(userId)` (each with its job posting's `id`, `title`, `company`), and `getAllApplicationsWithDetails()` (every application with both, for `/applications`). Every list is **newest first** (`ORDER BY created_at DESC, id DESC`). The two "by" lists check that the user / posting exists, so a missing one gives "not found" while an existing one with no applications gives `[]`.
- **How problems are reported** (a result instead of throwing, like the JobPosting Model):

  | Result | Meaning | HTTP response |
  |---|---|---|
  | `{ application }` / `{ applications }` | Success | 200 (read, update) / 201 (create) |
  | `true` / `false` from `deleteApplication` | Deleted / no application with this id | **204** / 404 |
  | `{ error: "validation", message }` | A rule is broken, e.g. `"status" must be one of: pending, accepted, rejected` | **400** |
  | `{ error: "invalid-id", message }` | An id can't match a row, e.g. `User id "abc" is not a valid number` | **400** |
  | `{ error: "not-found", message }` | The application doesn't exist | **404** `{"error": "not found", "reason": "No application with id …"}` |
  | `{ error: "user-not-found", message }` | The user doesn't exist (`23503` on `applications_user_id_fkey`) | **404** `{"error": "not found", "reason": "No user with id …"}` |
  | `{ error: "job-posting-not-found", message }` | The job posting doesn't exist (`23503` on `applications_job_posting_id_fkey`) | **404** `{"error": "not found", "reason": "No job posting with id …"}` |
  | `{ error: "already-applied", message }` | This user already applied to this posting (`23505` on `applications_user_id_job_posting_id_key`) | **409** `"User already applied to this job posting"` |
  | `{ error: "job-posting-closed", message }` | **Planned — not implemented yet.** The job posting's `status` is `closed` | **409** `"Job posting is closed"` |
- **Database errors aren't swallowed.** Any other database error is not caught by the Model: it goes on to the **error handler** middleware (→ **503** if the database can't be reached, otherwise **500** `{"error": "internal error"}`, logged once), like the other models.

---

## 🔗 Relationships

Users and job postings are connected in **one relationship only: many-to-many, through the `applications` join table** (the professor's whiteboard design). There is **no direct owner** link between a user and a job posting.

| Relationship | Kind | Stored in | Status |
|---|---|---|---|
| A user **applies to** job postings | many-to-many | the `applications` join table (`user_id`, `job_posting_id`) | ✅ **Implemented** (migration `005_create_applications`, `lib/models/application.ts`, `ApiApplicationController`) |

> **Status:** migration `003_create_job_postings` gave `job_postings` an owner column (`user_id` → `users.id`, one-to-many). That owner relationship is **not part of the design any more**: the column was **removed by migration `004_drop_job_postings_user_id`**, and the code that used it (the nested route `/api/users/{id}/jobs` and the owner functions in the Models) was **removed too** (✅ implemented). Since migration `005_create_applications`, users and job postings are linked in the database **only** through `applications`; the Application Model (`lib/models/application.ts`) reads and writes it, and its JSON API routes (`ApiApplicationController`) and the pages (`/jobs/{id}`, `/users/{id}`, `/applications`) use it (✅ implemented).

### User and Announcement (implemented)

**There is no relationship between User and Announcement.** `Announcement.author` is a **free text field**: it is not an id, it is not checked against the users, and deleting or renaming a user has no effect on any announcement. Two announcements by the same person can spell the author differently.

This was a **design decision** for the database; **Option A was chosen** (see the decisions below):

- **Option A — keep `author` as text.** Simple and matches the current API and forms. Works for authors who aren't users (e.g. "Alumni Office"), but there is no way to list "all announcements by user X" reliably.
- **Option B — make it a reference to a User** (`author_id` → `users.id`). Gives a real link and consistent names, but every author must then be a user, the forms and API would need to send a user id instead of a name, and we must decide what happens to announcements when their author is deleted.

See [Decisions and open questions](#-decisions-and-open-questions).

### Users ↔ Job postings: many-to-many through applications

> ✅ **Table implemented** by migration `005_create_applications`, and its **Model and rules** in `lib/models/application.ts` ([rules](#application--rules)), and its **JSON API** (`ApiApplicationController`, [routes](#-api-job-postings-and-applications)). The owner column `job_postings.user_id` is gone (migration 004), so `applications` is the **only** link between users and job postings (see [🔧 Changes needed in the code](#-changes-needed-in-the-code)).

**A user applies to job postings:** this is a **many-to-many** relationship — **one user can apply to many job postings, and one job posting can have many applicants.** A foreign key column can only hold one value, so neither table can store this on its own — `users` would need a list of posting ids, and `job_postings` a list of user ids. The usual solution is a **join table**, `applications`, with **one row per application**:

- `applications.user_id` is a **foreign key** to `users.id` — the applicant.
- `applications.job_posting_id` is a **foreign key** to `job_postings.id` — the posting applied to.
- So the many-to-many relationship becomes **two one-to-many relationships**: a user has many applications, a job posting has many applications, and each application belongs to exactly one user and one posting.
- A join table can also hold facts about the relationship itself — here the application's **`status`** (`pending`, `accepted` or `rejected`) and its timestamps.
- `UNIQUE (user_id, job_posting_id)` makes sure a user can apply to the same posting **only once**.

**A user's "jobs".** Because there is no owner, a user's **jobs** are **the job postings linked to that user through `applications`** — the postings they applied to. In the Models (without an ORM) this will be a plain SQL join, `applications JOIN job_postings … WHERE applications.user_id = $1`, and `GET /api/users/{id}` will be able to include them, like `User.find(1, { include: "jobs" })` — see the [include decision](#decision-how-get-apiusersid-includes-a-users-jobs).

What happens to applications when a user or a posting is deleted is the [Decision: delete rules for applications](#decision-what-happens-to-applications-when-a-user-or-a-job-posting-is-deleted).

---

## 📊 ER diagram

### Before the database (in-memory, history)

How the data looked when it was kept in memory: two separate entities with **no relationship**. `author` is plain text.

```mermaid
erDiagram
    USER {
        number id PK "auto-increment, set by the Model"
        string name "required"
        string email "optional"
        string age "optional, stored as text"
        string department "optional"
        string any_other_field "optional, dynamic fields"
    }
    ANNOUNCEMENT {
        number id PK "auto-increment, set by the Model"
        string title "required"
        string content "required"
        string author "optional, free text - not linked to USER"
        string createdAt "ISO date, set on create"
        string updatedAt "ISO date, refreshed on every change"
    }
```

### PostgreSQL (implemented — what the app uses now)

These tables are created by `migrations/` and used by the Models. The dashed relationship and `author_id` are the only parts **not** implemented: they would only exist if **Option B** is chosen later.

```mermaid
erDiagram
    USERS {
        bigint id PK "identity, never reused"
        text name "NOT NULL"
        text email "nullable"
        integer age "nullable, CHECK age >= 0"
        text department "nullable"
        jsonb extra "NOT NULL default empty - dynamic fields"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL, default now()"
    }
    ANNOUNCEMENTS {
        bigint id PK "identity, never reused"
        text title "NOT NULL"
        text content "NOT NULL"
        text author "nullable - Option A, free text"
        bigint author_id FK "NOT implemented - Option B only"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL, default now()"
    }
    USERS |o..o{ ANNOUNCEMENTS : "writes (NOT implemented, Option B only)"
```

### Users, job postings and applications (implemented)

**One relationship between users and job postings: many-to-many through `APPLICATIONS`.** All three tables and both relationship lines are **implemented** in the database (`APPLICATIONS` by migration `005_create_applications`) and **used by the app**: the Application Model, its JSON API routes (`ApiApplicationController`: `/api/jobs/{id}/applications`, `/api/users/{id}/applications`, `/api/applications`, `/api/applications/{id}`) and the pages (`/jobs/{id}`, `/users/{id}`, `/applications`). There is **no** direct line between `USERS` and `JOB_POSTINGS`: the old `job_postings.user_id` owner column was removed by migration 004 (✅ implemented), so the `JOB_POSTINGS` box shows the real table. (`USERS` is shortened to its key and name; its full columns are in the diagram above.)

```mermaid
erDiagram
    USERS {
        bigint id PK "implemented"
        text name "NOT NULL - implemented"
    }
    JOB_POSTINGS {
        bigint id PK "identity - implemented"
        text title "NOT NULL - implemented; PLANNED CHECK 3-120 chars"
        text company "nullable - implemented; PLANNED NOT NULL, CHECK 1-120 chars"
        text city "PLANNED (006) - nullable, CHECK 1-80 chars"
        text description "PLANNED (006) - nullable, CHECK 10-2000 chars"
        text employment_type "PLANNED (006) - NOT NULL, default full-time, CHECK"
        text status "PLANNED (006) - NOT NULL, default open, CHECK open closed"
        date deadline "PLANNED (006) - nullable"
        timestamptz created_at "NOT NULL, default now() - implemented"
        timestamptz updated_at "NOT NULL, default now() - implemented"
    }
    APPLICATIONS {
        bigint id PK "identity, never reused"
        bigint user_id FK "NOT NULL, the applicant, indexed"
        bigint job_posting_id FK "NOT NULL, indexed"
        text status "NOT NULL, default pending, CHECK pending accepted rejected"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL, default now()"
    }
    USERS ||--o{ APPLICATIONS : "applies to - ON DELETE CASCADE"
    JOB_POSTINGS ||--o{ APPLICATIONS : "is applied to - ON DELETE CASCADE"
```

The two lines into `APPLICATIONS` together form the **many-to-many** relationship: a user has many applications, a job posting has many applications, and each application joins exactly one user and one posting. Both delete rules are `ON DELETE CASCADE` ([decided](#decision-what-happens-to-applications-when-a-user-or-a-job-posting-is-deleted)).

`UNIQUE (user_id, job_posting_id)` (one application per user and posting) can't be drawn in Mermaid; it's in the [table](#-applications--implemented-migration-005) below.

**Planned columns.** Mermaid can't draw a dashed column, so the attributes marked **`PLANNED (006)`** in `JOB_POSTINGS` are **not implemented yet** (like `author_id` "NOT implemented" in the diagram above); they come with migration `006` — see the [planned columns](#-job_postings--implemented-planned-change-new-columns-and-rules). The relationship lines don't change.

---

## 🐘 Database design (PostgreSQL) — implemented

> **Status: implemented.** These tables are **created by the plain SQL migrations in `migrations/`** (`001_create_users`, `002_create_announcements`, then `003`–`005` for job postings and applications), which run automatically with `docker compose up` (see [🧱 Migrations](README.md#-migrations)), and **the app uses them**: the Models in `lib/models/` read and write them with plain, parameterized SQL through `lib/db.ts` (the `pg` driver — **no ORM**, confirmed by the professor). The PostgreSQL service is the `db` service in `docker-compose.yml` (`postgres:17-alpine`, with the `pgdata` volume).
>
> The choices made along the way are listed in [Decisions and open questions](#-decisions-and-open-questions). Any change to these tables is made with a new migration.
>
> **`users` and `announcements` are implemented and used by the app. [`job_postings`](#-job_postings--implemented-planned-change-new-columns-and-rules) is created by migration `003_create_job_postings` and used by the job postings JSON API and the `/jobs` pages; its owner column was removed by migration 004. [`applications`](#-applications--implemented-migration-005) is created by migration `005_create_applications` and used by the Application Model, its JSON API routes (`ApiApplicationController`) and the pages (`/jobs/{id}`, `/users/{id}`, `/applications`).**

### `users`

| Column | SQL type | Constraints | Note |
|---|---|---|---|
| `id` | `bigint` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Auto-increment, never reused — and, unlike the old in-memory counter, it keeps counting across restarts. Returned as a JS `number` |
| `name` | `text` | `NOT NULL`, `CHECK (btrim(name) <> '')` | Same rule as `UserController.validateName` |
| `email` | `text` | nullable | No unique or format constraint (open question 6) |
| `age` | `integer` | nullable, `CHECK (age >= 0)` | The controllers check it's a whole number before saving; returned as a JS `number` |
| `department` | `text` | nullable | Used by the users list page |
| `extra` | `jsonb` | `NOT NULL`, `DEFAULT '{}'::jsonb` | Every other dynamic field, e.g. `{"city": "Istanbul"}` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set by the database; not returned by the API (users kept their old shape) |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set to `now()` by the Model's `UPDATE` queries; not returned by the API |

**How to handle the dynamic User fields.** The API accepts any field, so the database needs a way to store fields it doesn't know in advance. The options that were considered:

1. **Only fixed columns** — every allowed field becomes a column. Clear and strictly typed, but any field not on the list would be rejected or lost, which changes how `POST /api/users` behaves today.
2. **Only a flexible `jsonb` column** — store the whole user except `id` in one JSON column. Keeps today's behaviour exactly, but the database can't enforce `name NOT NULL`, types or uniqueness, and queries are harder.
3. **Fixed columns + one `jsonb` column** — columns for the fields the code already knows (`name`, `email`, `age`, `department`), and an `extra` `jsonb` column for everything else.

**Chosen and implemented: option 3.** It keeps the API working (unknown fields still go somewhere instead of being dropped), while the fields the pages actually use get real types and constraints that PostgreSQL can enforce and index. A field that becomes important later can be moved from `extra` to its own column.

### `announcements`

| Column | SQL type | Constraints | Note |
|---|---|---|---|
| `id` | `bigint` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Auto-increment, never reused, keeps counting across restarts. Returned as a JS `number` |
| `title` | `text` | `NOT NULL`, `CHECK (btrim(title) <> '')` | Same rule as `validateAnnouncement` |
| `content` | `text` | `NOT NULL`, `CHECK (btrim(content) <> '')` | Same rule as `validateAnnouncement` |
| `author` | `text` | nullable | **Option A** (free text) — implemented |
| `author_id` | `bigint` | nullable, `REFERENCES users(id)` | **Option B only — not created** by the migrations (Option A was used); what happens on user delete (`ON DELETE SET NULL` or `RESTRICT`) would need deciding if Option B is chosen later |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Returned as the ISO string `createdAt` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set to `now()` by every replace / update query; returned as `updatedAt` |

An index on `announcements (created_at DESC)` supports the "newest first" list (`announcements_created_at_idx`), which `getAllAnnouncements()` uses.

### 💼 `job_postings` — implemented, planned change: new columns and rules

> **Status:** the table is **created by migration `003_create_job_postings`**. Migration 003 also gave it a `user_id` owner column (`bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE`, with the index `job_postings_user_id_idx`).
>
> ✅ **Column removal implemented:** following the whiteboard design, job postings have **no owner**. The **new migration `004_drop_job_postings_user_id`** (migration 003 was not edited) drops the foreign key `job_postings_user_id_fkey`, the index `job_postings_user_id_idx` and the `user_id` column. **The table below is the real table now.** Its `down` file adds `user_id` back only as **nullable and empty** — the old owners can't be restored.
>
> ✅ **Code updated:** the Model (`lib/models/jobPosting.ts`), `ApiJobPostingController` and the routes `/api/jobs`, `/api/jobs/{id}` work **without an owner** (verified against the Docker database after migration 004). Users and postings are linked only through [`applications`](#-applications--implemented-migration-005) (✅ table created by migration 005).
>
> **Planned change — not implemented yet (Week 7 design):** new columns and stricter rules, added by a new migration `006` (see [Planned columns](#planned-columns-migration-006) below and the [Job posting rules (planned)](#job-posting-rules-planned)).

#### Current columns (implemented)

| Column | SQL type | Constraints | Note |
|---|---|---|---|
| `id` | `bigint` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Auto-increment, never reused, like the other tables |
| `title` | `text` | `NOT NULL`, `CHECK (btrim(title) <> '')` | The job title, e.g. "Junior Data Analyst". Required and not blank — the same rule style as `announcements.title`. The Model also trims it and limits it to 200 characters |
| `company` | `text` | nullable | The hiring company, e.g. "Trendyol". Optional; the Model trims it, limits it to 200 characters, and stores an empty company as `NULL` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set by the database when the posting is created |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set to `now()` by every replace / update query in the Model (no trigger), like the other tables |

The job postings API is described, with what changes, in the [API](#-api-job-postings-and-applications).

**No extra index.** The old `job_postings_user_id_idx` was dropped with the `user_id` column (migration 004). Lookups between users and postings will go through the `applications` indexes instead.

#### Planned columns (migration 006)

> **Planned — not implemented yet.** The full set of columns after the planned migration `006_add_job_posting_details` (name to be confirmed when it is written). Migrations 001–005 are **not edited**. "Rule" is what the Model checks (after trimming — [rule 1](#job-posting-rules-planned)); "Database" is what PostgreSQL will enforce.

| Column | SQL type | Required? | Default | Rule (Model) | Database (planned) |
|---|---|---|---|---|---|
| `id` | `bigint` | Set by the database | identity | Unchanged | Unchanged (`PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY`) |
| `title` | `text` | **Required** | — | **3 to 120** characters (today 1–200) | `NOT NULL` (as today), new `CHECK (char_length(btrim(title)) BETWEEN 3 AND 120)` |
| `company` | `text` | **Required** — **a change**, optional today | — | **1 to 120** characters (today optional, ≤ 200) | new `NOT NULL`, new `CHECK (char_length(btrim(company)) BETWEEN 1 AND 120)` |
| `city` | `text` | Optional | `NULL` | at most **80** characters; empty → `NULL` | `CHECK (city IS NULL OR char_length(btrim(city)) BETWEEN 1 AND 80)` |
| `description` | `text` | Optional | `NULL` | **10 to 2000** characters when given; empty → `NULL` | `CHECK (description IS NULL OR char_length(btrim(description)) BETWEEN 10 AND 2000)` |
| `employment_type` | `text` | Required (has a default) | `'full-time'` | one of `full-time`, `part-time`, `internship`, `contract` | `NOT NULL DEFAULT 'full-time'`, `CHECK (employment_type IN ('full-time', 'part-time', 'internship', 'contract'))` |
| `status` | `text` | Required (has a default) | `'open'` | one of `open`, `closed` | `NOT NULL DEFAULT 'open'`, `CHECK (status IN ('open', 'closed'))` |
| `deadline` | `date` | Optional | `NULL` | a valid `YYYY-MM-DD` date, **not in the past**; checked only when set or changed | nullable `date` (the type rejects impossible dates); "not in the past" is **Model only** ([rule 7](#job-posting-rules-planned)) |
| `created_at` | `timestamptz` | Set by the database | `now()` | Unchanged | Unchanged |
| `updated_at` | `timestamptz` | Set by the database | `now()` | Unchanged, refreshed by every update | Unchanged |

Like `applications.status`, the lists use `text` + `CHECK` rather than an `ENUM`, so a value can be added later with another migration. The two `status` columns are different things: `job_postings.status` (`open` / `closed`) says whether a posting takes applications; `applications.status` (`pending` / `accepted` / `rejected`) says where one application stands.

**What migration 006 does, in order** (one transaction, like every migration):

1. **Add the new columns** — `city`, `description` and `deadline` nullable; `employment_type` and `status` `NOT NULL` with their defaults, so **every existing row gets `full-time` and `open`**.
2. **Fix existing rows that would break the new rules**, before any constraint is added:
   - `company` that is `NULL`, empty or only spaces → the placeholder **`'Unknown company'`** (chosen here; open question 30). It is a real value, so it passes the new rules, and it is easy to find and correct later (`WHERE company = 'Unknown company'`).
   - surrounding spaces are trimmed (`title = btrim(title)`, `company = btrim(company)`), as the Model already does today.
   - `title` or `company` **longer than 120** characters (the Model allowed up to 200) → cut to 120 characters. `title` **shorter than 3** characters (the Model allowed 1) → the migration **stops with a clear error listing those ids**, instead of inventing a title; they are fixed by hand and the migration is run again (open question 31).
3. **Add `NOT NULL` on `company`**, then the **`CHECK` constraints** above, each with a clear name (e.g. `job_postings_title_length_check`), so the Model or the shared error helper can tell them apart.

Its **`down` file** drops the five new columns (their `CHECK` constraints go with them), the new `CHECK` constraints on `title` and `company`, and `NOT NULL` on `company`. The placeholder companies and the cut titles are **not** turned back — the old values are gone, like migration 004's owners.

**Existing rows and the seed stay valid.** Checked against the Docker database (read-only, before this design): its 10 job postings all have a company, titles of 13–30 characters and companies well under 120, so step 2 changes nothing there. The seeded titles and companies (`jobPostingFactory.mjs`) already fit the new limits; the factory will get the new fields so seeded postings fill **every required field** (see the [planned changes](#planned-job-posting-fields-and-rules)).

### 📝 `applications` — implemented (migration 005)

> ✅ **Table implemented:** created by **migration `005_create_applications`** (its `down` file drops the table again), after the migration that removed the owner column (`004_drop_job_postings_user_id`). It follows the same style as the other tables (`bigint` identity ids, `snake_case` columns, `timestamptz` timestamps). ✅ **Model implemented:** `lib/models/application.ts`, with the [rules](#application--rules). ✅ **Routes implemented:** `ApiApplicationController` and the nested / direct [routes](#-api-job-postings-and-applications). ✅ **Pages implemented:** the Applications section on `/jobs/{id}` (add by choosing a user, change the status, remove), a read-only one on `/users/{id}`, and the **`/applications`** page listing every application (with the same status and remove actions); they read through three read-only joins, `getApplicationsWithUsersByJobPostingId`, `getApplicationsWithJobPostingsByUserId` and `getAllApplicationsWithDetails`. **Not yet:** a factory and seed for applications. `seed:fresh` empties `applications` through `CASCADE`.
>
> **Delete rule (CASCADE):** if a user or a job posting is deleted, all of its applications are deleted with it.

| Column | SQL type | Constraints | Note |
|---|---|---|---|
| `id` | `bigint` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Auto-increment, never reused, like the other tables |
| `user_id` | `bigint` | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | **Foreign key** to the **applicant**; same type as `users.id`. Deleting the user deletes their applications ([decision below](#decision-what-happens-to-applications-when-a-user-or-a-job-posting-is-deleted)) |
| `job_posting_id` | `bigint` | `NOT NULL`, `REFERENCES job_postings(id) ON DELETE CASCADE` | **Foreign key** to the **job posting applied to**; same type as `job_postings.id`. Deleting the posting deletes its applications ([decision below](#decision-what-happens-to-applications-when-a-user-or-a-job-posting-is-deleted)) |
| `status` | `text` | `NOT NULL`, `DEFAULT 'pending'`, `CHECK (status IN ('pending', 'accepted', 'rejected'))` | Where the application stands. A new application is `pending`; the `CHECK` makes PostgreSQL reject any other value (error `23514`) |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | When the user applied; set by the database |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Set to `now()` by every update query (e.g. a status change) in the Model, no trigger — like the other tables |

**Table constraint.** `UNIQUE (user_id, job_posting_id)` (named `applications_user_id_job_posting_id_key`) — **one application per user and posting.** Applying twice to the same posting is rejected by PostgreSQL with a unique violation (`23505`). The API reports it as **409 Conflict** (see the [API](#-api-job-postings-and-applications)): the Application Model catches the `23505` itself and returns `already-applied`, which `ApiApplicationController` maps to 409 (the shared error helper would have made it a 400).

**Indexes.** PostgreSQL doesn't index foreign keys by itself, so each one gets its own index: `applications_user_id_idx` ("all applications of user X") and `applications_job_posting_id_idx` ("all applicants of posting Y"). They also let PostgreSQL apply the delete rule quickly when a user or a posting is deleted. (The unique constraint creates a third index, on `(user_id, job_posting_id)`.)

**Why `text` + `CHECK` for `status`.** A `CHECK` on a `text` column is easy to read and to change later with a new migration (e.g. adding a `withdrawn` status). A PostgreSQL `ENUM` type would also work, but changing its values is more awkward.

#### Decision: what happens to applications when a user or a job posting is deleted?

> ✅ **Decided and implemented: `ON DELETE CASCADE` on both foreign keys** (migration `005_create_applications`). Both options are kept below for reference.

**1. `user_id` — when the applicant is deleted**

| Option | What happens | Trade-off |
|---|---|---|
| **`ON DELETE CASCADE`** | The user **and all their applications** are deleted together | Simple; the existing Delete button and `DELETE /api/users/{id}` keep working. The postings lose that applicant from their lists, with no trace |
| **`ON DELETE RESTRICT`** | Deleting a user who has applied is **refused** until their applications are deleted | Keeps every application on record. But any user who ever applied can't be deleted without extra steps, and today's Delete would show an error |

**2. `job_posting_id` — when the job posting is deleted**

| Option | What happens | Trade-off |
|---|---|---|
| **`ON DELETE CASCADE`** | The posting **and all its applications** are deleted together | Simple; `DELETE /api/jobs/{id}` keeps working. Applicants lose the record that they applied |
| **`ON DELETE RESTRICT`** | Deleting a posting that has applications is **refused** | Protects applicants' history. But `DELETE /api/jobs/{id}` would fail for any posting with applicants until they're removed |

**Why `ON DELETE CASCADE` on both.**
- An application only means something while **both** its applicant and its posting exist (both columns are `NOT NULL`, so `SET NULL` isn't possible).
- Today's Delete actions (`DELETE /api/users/{id}`, the Delete button, `DELETE /api/jobs/{id}`) keep working without extra steps.
- With no owner column any more, deleting a user no longer deletes job postings — only that user's applications.

The trade-off is that application history disappears with the user or the posting. If keeping that history matters later, a better tool than `RESTRICT` would be to **close** postings instead of deleting them (e.g. a status on `job_postings`) — an open question below.

**Sample data.** Development sample data comes from the **factories** in `scripts/factories/` and the **seed** script `scripts/seed.mjs` (see [🌱 Factories and Seeding](README.md#-factories-and-seeding)), which inserts 10 users, 8 announcements and 10 job postings with parameterized SQL (applications are not seeded). The factories follow the table rules: every user has a non-blank `name`, a **unique `email`** (it contains the user's number, even though the table itself has no unique constraint yet — open question 6), an `age` between 22 and 45 (`>= 0`), a `department`, and an `extra` object (some users get a `city`); every announcement has a non-blank `title` and `content`, a free-text `author` (sometimes empty, since it's optional — Option A), and fixed `created_at` / `updated_at` dates one day apart; every job posting has a realistic `title` (e.g. "Junior Data Analyst") and `company` (e.g. "Trendyol") that pass the JobPosting Model's rules (non-blank, trimmed, at most 200 characters), no owner, and fixed dates one day apart. A normal seed checks users + announcements together and job postings on their own (each group is seeded only if empty); `--fresh` runs `TRUNCATE users, announcements, job_postings RESTART IDENTITY CASCADE`, which also empties `applications`. Values are picked in order, not randomly, so every seed gives the same data.

**`updated_at`.** No table has a trigger: the Models set `updated_at = now()` in their `UPDATE` queries (implemented for all four tables).

**Naming.** Columns use `snake_case` (the usual PostgreSQL style), while the app uses `camelCase` (`createdAt`). The Models translate between them in small mapping functions (`toUser`, `toAnnouncement`, `toJobPosting`, `toApplication`), so the API's JSON didn't have to change.

**Queries.** Every query is plain SQL with `$1, $2, …` parameters — never built by string concatenation, so input like `x'); DROP TABLE users; --` is stored as plain text. Creates, updates and deletes use `… RETURNING`, so one query both changes and returns the row. A partial update (`PATCH`) uses one fixed `UPDATE` with a "was this field sent?" flag per column, and merges extra fields with `extra || $n::jsonb`.

---

## 🧭 API: job postings and applications

> **Job postings and applications: implemented** (✅ `ApiJobPostingController`, `ApiApplicationController`, verified with `curl` against the Docker database). Only the `?include=jobs` row is still planned. Bodies are JSON or form-data, like today's job postings API. "URL" means an id taken from the path; "body" means a field sent in the request body. Every route can also answer **503** `{"error": "service unavailable", "reason": "The database is not reachable. Try again later."}` or **500** `{"error": "internal error"}` ([Error shapes](#error-shapes-of-the-json-api)). The **Today** column says what exists now.

| Method | URL | What it does | Id from the URL | From the body | Success | Errors | Today |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/jobs` | Create a job posting | — | `title` (required), `company`; any `id` / `userId` / `createdAt` is ignored. **Planned:** `company` required; also `city`, `description`, `employmentType`, `status`, `deadline` ([rules](#job-posting-rules-planned)) | **201** + the posting | 400 invalid data or body. **Planned:** the 400 for invalid data lists every field: `{ "error": "validation failed", "fields": { … } }` | ✅ **Implemented** (new fields and 400 shape **Planned**) |
| `GET` | `/api/jobs` | All postings, newest first | — | — | 200 | — | Implemented |
| `GET` | `/api/jobs/{id}` | One posting | `{id}` = **job posting** | — | 200 | 400 invalid id; 404 "No job posting with id …" | ✅ Implemented (no `userId`) |
| `PATCH` | `/api/jobs/{id}` | Change `title` and/or `company` | `{id}` = **job posting** | `title`, `company`. **Planned:** any of the new fields too; only the sent fields are checked, and the result must still be valid | 200 + the posting | 400; 404. **Planned:** 400 in the `fields` shape | ✅ Implemented (no owner; new fields **Planned**) |
| `DELETE` | `/api/jobs/{id}` | Delete the posting (and, by CASCADE, its applications) | `{id}` = **job posting** | — | **204**, no body | 400; 404 | ✅ Implemented |
| `POST` | `/api/jobs/{id}/applications` | User applies to posting `{id}` | `{id}` = **job posting** | `userId` (the applicant) — required, e.g. `{"userId": 3}` | **201** + the application (`status: "pending"`) | 400 invalid data / ids; 404 user or posting not found; **409** already applied. **Planned:** **409** `"Job posting is closed"` when the posting's `status` is `closed` (a passed deadline does not refuse) | ✅ **Implemented** (closed check **Planned**) |
| `GET` | `/api/jobs/{id}/applications` | The **applicants** of posting `{id}` | `{id}` = **job posting** | — | 200 (empty list is fine) | 400 invalid id; 404 posting not found | ✅ **Implemented** |
| `GET` | `/api/users/{id}/applications` | What user `{id}` **applied to** | `{id}` = **user** | — | 200 (empty list is fine) | 400 invalid id; 404 user not found | ✅ **Implemented** |
| `GET` | `/api/users/{id}?include=jobs` | The user, with a `jobs` list inside: the postings linked through `applications` | `{id}` = **user** | — (`include` is a **query** parameter) | 200 | 400 unknown `include` value; 404 user not found (as today) | Planned — see the [Decision](#decision-how-get-apiusersid-includes-a-users-jobs). Without `include`, the response stays exactly as today |
| `GET` | `/api/applications` | All applications | — | — | 200 | — | ✅ **Implemented** |
| `GET` | `/api/applications/{id}` | One application | `{id}` = **application** | — | 200 | 400; 404 | ✅ **Implemented** |
| `PATCH` | `/api/applications/{id}` | Change the **status only** | `{id}` = **application** | `status` (`pending`, `accepted`, `rejected`); `userId` / `jobPostingId` ignored | 200 + the application | 400 missing / invalid status, invalid id; 404 | ✅ **Implemented** |
| `DELETE` | `/api/applications/{id}` | Withdraw / remove the application | `{id}` = **application** | — | **204**, no body | 400; 404 | ✅ **Implemented** |

**Removed:** `POST /api/users/{id}/jobs` and `GET /api/users/{id}/jobs` — the nested routes depended on the owner column and were **deleted** (✅ implemented; they now answer 404). A posting is created with `POST /api/jobs`, and a user's jobs will come from `GET /api/users/{id}?include=jobs` or `GET /api/users/{id}/applications`.

#### Error shapes of the JSON API

The target is **one shape per kind of error**, the same for every API route:

| Status | Shape | Status of this design |
|---|---|---|
| **404** | `{ "error": "not found", "reason": "<clear sentence>" }`, e.g. `"No job posting with id 99999"`, `"No user with id 99999"`, `"No route matches GET /api/doesnotexist"` | ✅ **Implemented** for every API 404: the **404 guard** middleware (`withExists` in `lib/middleware/notFoundGuard.ts`) on every route with an `[id]` checks through the Model's get-by-id function that the row exists and answers this 404 **without calling the controller**; the controllers use the same helper (`notFound(reason)` in `lib/http/notFound.ts`) for a missing id in the body (`userId` in `POST /api/jobs/{id}/applications`) or a row deleted after the guard; a catch-all route (`app/api/[...path]/route.ts`) answers it for unknown API paths. Documented as the `NotFound` schema in `lib/openapi.ts` |
| **400** (validation) | `{ "error": "validation failed", "fields": { "<field>": "<message>", … } }` | **Planned — not implemented yet**: the target for ALL APIs (question 35), through the validation middleware in a later Week 7 task. Until then: `{ "error": "<message>" }` |
| **503** | `{ "error": "service unavailable", "reason": "The database is not reachable. Try again later." }` | ✅ **Implemented**: the **error handler** middleware (`withErrorHandler` in `lib/middleware/errorHandler.ts`, right after the logger in every API line) answers it when the database can't be reached (the container is stopped — `ENOTFOUND`, the connection is refused / reset / times out, PostgreSQL class `08`, `57P01`–`57P03`, `53300`) |
| **500** | `{ "error": "internal error" }` | ✅ **Implemented** by the same error handler for any other unexpected error. Neither 5xx body contains the error message, stack trace, SQL, table or constraint names, or file paths; the full error is logged **once** on the server (terminal), with the method and path, and appended as one entry to `logs/error.log` (`lib/log/errorFile.ts`; the file is git-ignored). Built by `lib/http/serverError.ts`; documented as the `ServerError` schema in `lib/openapi.ts` |
| 400 (other), 409 | `{ "error": "<message>" }` | ✅ Implemented, unchanged — including the 400s for data the database rejects (`23505`, `23503`, `23514`, `23502`, `22P02`, `22003`), now answered by the error handler with the same messages |

The guard only looks up ids that are whole numbers above 0; for anything else (`abc`, `0`) the controller answers **as before**: **400** for `abc` or `0` on job postings, applications and a user's applications, and for `abc` on announcements; **404** for `abc` or `0` on `/api/users/{id}` and for `0` on `/api/announcements/{id}` (question 10) — those 404s now in the shape above (`No user with id abc`). **Open item:** this difference is to be made consistent in the validation task.

#### Decision: how `GET /api/users/{id}` includes a user's jobs

> **Decision — to be confirmed.** The recommendation below is not final.

**Recommendation: a query parameter, `GET /api/users/{id}?include=jobs`.**
- It's the usual REST way to ask for related data (like `User.find(1, { include: "jobs" })`), and it keeps `GET /api/users/{id}` **unchanged** when `include` isn't sent, so nothing that uses the API today breaks.
- It can grow: `include` takes a comma-separated list (e.g. `include=jobs,applications` later). An **unknown value** gives **400**, so a typo doesn't silently return less data.
- It's served by one plain-SQL join (`applications JOIN job_postings`), not one query per job.

**What each included job contains (recommended):** the job posting's own fields, plus an `application` object for **this user's** application to it — so the job fields and the application fields don't get mixed up:

```json
{
  "id": 3,
  "name": "Elif Koç",
  "email": "elif.koc3@outlook.com",
  "jobs": [
    {
      "id": 7,
      "title": "Junior Developer",
      "company": "Acme",
      "createdAt": "2026-10-21T09:30:00.000Z",
      "updatedAt": "2026-10-21T09:30:00.000Z",
      "application": { "id": 12, "status": "pending", "appliedAt": "2026-10-22T08:00:00.000Z" }
    }
  ]
}
```

- `jobs` is **always an array** — `[]` if the user applied to nothing.
- Ordered by **most recent application first** (`applications.created_at DESC`).
- `application.appliedAt` is the application's `created_at`; `status` is its current status.
- **Alternative** (not recommended): flat fields such as `applicationStatus` on each job — shorter, but it mixes job and application data and gets crowded if more application fields are added.

---

## 🔧 Changes needed in the code

> **Status:** the **migration** (✅ `004_drop_job_postings_user_id`) and the **job-posting code changes** (✅) are **done** and verified against the Docker database. The `applications` table is **created** too (✅ migration `005_create_applications`). Its **Model** (✅ `lib/models/application.ts`) and **JSON API** (✅ `ApiApplicationController`, nested and direct routes) are done too. The **pages** are done too (✅ `/jobs`, `/jobs/new`, `/jobs/{id}` with its Applications section, `/jobs/{id}/edit`, the Applications section on `/users/{id}`, and `/applications`), with one shared design in the university colors (see [🎨 Design and theme](README.md#-design-and-theme)). What's left is the include, an applications factory and seed, and the **planned Week 7 job posting fields and rules** ([below](#planned-job-posting-fields-and-rules)) with the validation middleware (later steps).

| Where | What depends on the owner today | Change needed |
|---|---|---|
| `migrations/003_create_job_postings.up.sql` | Creates `user_id … REFERENCES users(id) ON DELETE CASCADE` and `job_postings_user_id_idx` | ✅ **Done:** 003 **not edited**; the **new migration `004_drop_job_postings_user_id`** drops the foreign key, the index and the column. ✅ **Then:** `005_create_applications` created the `applications` table |
| `lib/models/jobPosting.ts` | The `JobPosting.userId` field, `user_id` in the SQL and mapping, `createJobPosting(userId, data)` with the user-must-exist check, `getJobPostingsByUserId`, `getOwnerOfJobPosting` | ✅ **Done:** no `userId` / `user_id`; `createJobPosting(data)`; the two owner functions, the user-must-exist rule and the `23503` handling removed. `validateJobPosting` and the invalid-id results kept. (The Models' log-and-rethrow was removed later, in Week 7: unexpected errors now go to the error handler middleware) |
| `lib/models/user.ts` | `getJobPostingsForUser(userId)` and the header comment about deleting a user's postings | ✅ **Done:** removed (the file is back to its Week 5 version). **Later:** "jobs through applications" for `?include=jobs` |
| `lib/controllers/ApiJobPostingController.ts` | `createForUser`, `getAllForUser`, the "User not found" mapping | ✅ **Done:** replaced by `create` (`POST /api/jobs`); `getAll`, `getById`, `update`, `delete` kept |
| `app/api/users/[id]/jobs/route.ts` | The nested routes `GET` / `POST /api/users/{id}/jobs` | ✅ **Done:** file and folder deleted; `POST` added to `app/api/jobs/route.ts` |
| `lib/openapi.ts` (Swagger) | `jobOwnerIdParam`, the nested path, `userId` in the schema and examples, the owner wording | ✅ **Done:** all removed; `POST /api/jobs` documented. ✅ The 7 applications routes documented (tag **API Applications**, `ApplicationStatus` enum). **Later:** `?include=jobs` |
| `lib/models/application.ts` | — (new) | ✅ **Done:** the Application Model and its [rules](#application--rules) |
| `lib/controllers/ApiApplicationController.ts`, `app/api/jobs/[id]/applications/`, `app/api/users/[id]/applications/`, `app/api/applications/` | — (new) | ✅ **Done:** `createForJob`, `getAllForJob`, `getAllForUser`, `getAll`, `getById`, `updateStatus`, `delete`; the nested routes take the parent id from the URL only |
| `lib/controllers/JobPostingController.ts`, `lib/controllers/ApplicationController.ts`, `app/jobs/`, `lib/views/jobs/`, `lib/views/applications/`, `app/users/[id]/page.tsx` | — (new pages) | ✅ **Done:** the job posting pages (`/jobs`, `/jobs/new`, `/jobs/{id}`, `/jobs/{id}/edit`), the Applications section on `/jobs/{id}` (add, change status, remove) and a read-only one on `/users/{id}`, built like the announcement pages. Two **read-only** Model functions were added for them: `getApplicationsWithUsersByJobPostingId`, `getApplicationsWithJobPostingsByUserId` (joins, no new rules) |
| `app/applications/page.tsx`, `lib/views/applications/ApplicationListView.tsx`, `lib/views/ui/`, `app/globals.css` | — (new page and design) | ✅ **Done:** the `/applications` page (`ApplicationController.getAll` → one more **read-only** join, `getAllApplicationsWithDetails`, no new rules) and the shared design: theme tokens from the logo's colors and reusable UI pieces |
| `lib/controllers/ApiUserController.ts`, `app/api/users/[id]/route.ts` | — (nothing depends on the owner) | Add the `include=jobs` option to `GET /api/users/{id}` (later task) |
| `scripts/factories/`, `scripts/seed.mjs` | **Nothing** — they didn't create job postings or use `user_id` | ✅ Verified: after migration 004, `TRUNCATE users, announcements … CASCADE` no longer emptied `job_postings`. ✅ **Done (later task):** `scripts/factories/jobPostingFactory.mjs` and 10 seeded job postings; `--fresh` now truncates `job_postings` itself (question 12) |
| `README.md` | Features, Project Structure, MVC tables, routes tables and request flow for `POST /api/users/{id}/jobs`, the migrations table | ✅ **Done:** updated to the owner-less job postings |
| `ddd.md` | — | ✅ **Done:** the owner removal, `applications` and the pages are marked implemented |

### Planned: job posting fields and rules

> **Planned — not implemented yet (Week 7 design).** What later tasks will have to change for the [planned columns](#planned-columns-migration-006) and the [Job posting rules (planned)](#job-posting-rules-planned). Rows created before the change and the seed must **stay valid** at every step.

| Where | Change needed |
|---|---|
| New migration `migrations/006_…up.sql` + `.down.sql` | Add `city`, `description`, `employment_type` (default `full-time`), `status` (default `open`), `deadline`; **first** fix existing rows (company `NULL` / empty → `'Unknown company'`, trim, cut over-long values, stop on titles under 3 characters), **then** add `NOT NULL` on `company` and the named `CHECK` constraints; a matching `down` file. Migrations 001–005 stay untouched ([details](#planned-columns-migration-006)) |
| `lib/models/jobPosting.ts` | `JobPosting` type, `JobPostingRow`, `COLUMNS`, `toJobPosting` and the SQL get the new fields (`employment_type` → `employmentType`; `deadline` read and returned as a `"YYYY-MM-DD"` text (✅ confirmed, question 33), e.g. `deadline::text` in the `SELECT` — `pg` would otherwise turn a `date` into a JavaScript `Date` at local midnight, which can shift the day). `validateJobPosting` implements rules 1–10 and returns **every** broken field (`{ error: "validation", fields }`); `updateJobPosting` reads the stored posting to validate the merged result and to know whether `deadline` changed (✅ confirmed: "changed" = different from the stored value, question 32). Limits change to 120 (`TITLE_MAX_LENGTH`, `COMPANY_MAX_LENGTH`) |
| `lib/controllers/ApiJobPostingController.ts` | Answer **400** `{ "error": "validation failed", "fields": { … } }` for validation results; bad body and invalid id keep `{ "error": "…" }` |
| Validation middleware (a later Week 7 task) | Apply the `{ "error": "validation failed", "fields": { … } }` shape to **every** API (users, announcements, applications as well as job postings) — ✅ confirmed as the target (question 35). Until then, every API keeps `{ "error": "<message>" }`. It is added to the middleware lines in `lib/middleware/index.ts` (✅ implemented today: logger → error handler → 404 guard), after the 404 guard, so every API route gets it. The same task makes invalid ids consistent: today `/api/users/abc` and `/api/users/0` answer 404 while `/api/jobs/abc` answers 400 (question 10) |
| `lib/models/application.ts`, `lib/controllers/ApiApplicationController.ts`, `lib/controllers/ApplicationController.ts` | `createApplication` refuses a **closed** posting inside the insert statement and returns `{ error: "job-posting-closed" }`; the API answers **409** `"Job posting is closed"`, the page shows the same message |
| `lib/controllers/databaseErrors.ts` | Consider mapping invalid-date errors (`22007`, `22008`) to a 400 like `22P02`, in case a bad date ever reaches the database |
| `lib/openapi.ts` (Swagger) | The new fields in the `JobPosting`, `JobPostingInput` and `JobPostingPatch` schemas (with the enums and length limits), `company` required, the new 400 shape with `fields`, and the 409 `"Job posting is closed"` on `POST /api/jobs/{id}/applications` |
| `scripts/factories/jobPostingFactory.mjs`, `scripts/seed.mjs` | Realistic `city` (e.g. Istanbul, Ankara, Izmir), `description`, a mix of `employment_type` and `status` values, and `deadline`s — most postings **7 to 60 days ahead** of the day the seed runs (Istanbul time) and a few with **no deadline** (✅ confirmed, open question 33); **every required field filled**; the seed's `INSERT` lists the new columns |
| `lib/controllers/JobPostingController.ts`, `app/jobs/actions.ts`, `lib/views/jobs/` | The `/jobs/new` and edit forms get the new fields (city, description, an employment-type and a status dropdown, a date input for the deadline) and show **each field's error next to it**; the list and detail pages show the new fields and the status (e.g. a `StatusBadge`-style badge for `open` / `closed`) |
| `README.md` | Features, the `job_postings` rules and fields, the routes tables, the migrations table (migration 006) and the request-flow example — as `AGENTS.md` requires for any data-layer change |
| `ddd.md` | Mark each part **implemented** as it is done |

### What broke, and what is fixed

Between migration 004 and the code update, the job-posting code still named the dropped `user_id` column in its SQL, so most job-posting requests would have failed at runtime (PostgreSQL error `42703`, answered as 500). **All of that is fixed now** (✅ verified with `curl` against the Docker database):

| File | What used `user_id` | Now |
|---|---|---|
| `lib/models/jobPosting.ts` | `COLUMNS` / `JobPostingRow` / `toJobPosting`, `createJobPosting`, `getAllJobPostings`, `getJobPostingById`, `updateJobPosting`, `getJobPostingsByUserId`, `getOwnerOfJobPosting` | ✅ Fixed — no `user_id`; the two owner functions removed |
| `lib/models/user.ts` | `getJobPostingsForUser` | ✅ Removed |
| `lib/controllers/ApiJobPostingController.ts` | `createForUser`, `getAllForUser`, `getAll`, `getById`, `update` | ✅ Fixed — `create`, `getAll`, `getById`, `update`, `delete` |
| Routes | `/api/users/{id}/jobs` (GET, POST), `/api/jobs` (GET), `/api/jobs/{id}` (GET, PATCH) | ✅ `/api/jobs` (GET, POST) and `/api/jobs/{id}` (GET, PATCH, DELETE) work; the nested route is gone (404) |
| `lib/openapi.ts` | Documented the nested routes and `userId` | ✅ Updated |
| `scripts/factories/`, `scripts/seed.mjs` | Nothing | Unchanged and working |
| Users and announcements (pages, API), `/api/health`, `/api/swagger` | Nothing | Unchanged and working |

**Existing rows.** Dropping `user_id` **permanently loses who created each existing job posting** — after migration 004 the database no longer knows it. The rows themselves are **kept**: every posting keeps its `id`, `title`, `company` and timestamps, so `GET /api/jobs` still lists them. The owners are **not** turned into applications, because owning a posting and applying to it mean different things. Migration 004's `down` file can add the column back, but only as **nullable and empty** — the old owner values can't be restored. If that information matters, it must be exported (e.g. `SELECT id, user_id FROM job_postings`) **before** migration 004 runs on that database — and `docker compose up` runs pending migrations automatically. Migration 003 hadn't been committed yet; even so, the rule was followed and a new migration was added rather than editing 003.

---

## ❓ Decisions and open questions

The job postings design added questions 11–15, the JobPosting Model 16–17, and the applications design 18–24. **The many-to-many change** (no owner column) **removes questions 11, 14 and 19**, which only made sense with an owner: 11 (what happens to a user's postings when the user is deleted), 14 (how a posting's user is chosen) and 19 (may a user apply to their own posting). It decides question 18 and adds questions 25–29. **The Week 7 job posting design** (planned) updates questions 13, 15, 16 and 22 and adds questions 30–37.

| # | Question | Status |
|---|---|---|
| 1 | **ORM or plain SQL?** ~~Supabase JS client, Prisma, Drizzle~~ — not chosen. | ✅ **Decided: PostgreSQL, no ORM (plain SQL), confirmed by the professor.** Implemented with the `pg` driver (one shared pool in `lib/db.ts`) |
| 2 | **Should `Announcement.author` reference a User** (Option B) or stay free text (Option A)? If it references a user: what happens to an author's announcements when the user is deleted, and how do non-user authors like "Alumni Office" work? | ✅ **Implemented: Option A** (`author text`, no `author_id`). Can be changed later with a new migration |
| 3 | **Do ids stay numeric** (auto-increment `bigint`) or switch to UUIDs? The routes, Swagger docs and the announcement id check (`/^\d+$/`) all assume whole-number ids today. | ✅ **Implemented: numeric** (`bigint GENERATED ALWAYS AS IDENTITY`, returned as a JS `number`) |
| 4 | **How to store dynamic User fields** — fixed columns, `jsonb`, or both? Should the API keep accepting *any* field at all? | ✅ **Implemented: option 3** — fixed columns + `extra jsonb`; the API still accepts any field |
| 5 | **Should `age` become a number?** In the in-memory version it was free text with no server-side check. | ✅ **Implemented: yes** — `integer` with `CHECK (age >= 0)`; the API returns it as a number, and the controllers reject an age that isn't a whole number with a 400 |
| 6 | **Should `email` be unique and format-checked?** Neither is enforced. | **Still open.** Implemented as nullable `text` with no constraint. If a unique index is added later, a duplicate email will get a clear 400 (`23505` is already handled) |
| 7 | **Should users get `created_at` / `updated_at`** like announcements? | ✅ **Implemented in the table** (`updated_at` set on every change), but **not returned** by the API yet, to keep the users' JSON shape |
| 8 | **Empty values:** should cleared fields be stored as `""` or `NULL`? | **Partly decided:** text fields keep the old behaviour (`""`); a cleared `age` becomes `NULL` (an integer can't be `""`); fields never sent are `NULL` and left out of the JSON. Whether text fields should also become `NULL` is still open |
| 9 | **Trimming:** values are validated with `trim()` but stored with their surrounding spaces. Should they be trimmed before saving? | Still open (values are stored as sent, as before) |
| 10 | **Invalid ids:** an id like `abc` gives 400 for job postings, applications and announcements but 404 for users (and `0` gives 404 for users and announcements, 400 for job postings and applications). Should they all behave the same? | **Still open — to be settled in the validation task.** Kept exactly as before when the database was connected, and kept again by the 404 guard (it steps aside for ids that aren't whole numbers above 0). The users' 404 now uses the shared shape (`No user with id abc`) |
| 12 | **Seeding with `--fresh`:** `scripts/seed.mjs --fresh` runs `TRUNCATE users, announcements … CASCADE`. Since migration 004, job postings no longer reference users, so `--fresh` **keeps** them (✅ verified: 3 postings survived a `seed:fresh`); since migration 005 it also empties `applications` (through the `user_id` foreign key's CASCADE). Should the seed reset and create job postings explicitly? | ✅ **Decided and implemented: yes.** The seed creates 10 job postings (`jobPostingFactory.mjs`); `--fresh` runs `TRUNCATE users, announcements, job_postings RESTART IDENTITY CASCADE` (which also empties `applications`); a normal seed adds job postings only if `job_postings` is empty |
| 13 | **Should `company` be required** (`NOT NULL`) like `title`? | ✅ **Decided: optional** — the Model's rules allow it to be left out (empty → `NULL`). **Planned change (Week 7 design): required**, 1–120 characters, with `NOT NULL` in migration 006 ([rules](#job-posting-rules-planned)) |
| 15 | **More columns for job postings?** e.g. a description, location, link to apply, or closing date. | **Planned (Week 7 design):** `city`, `description`, `employment_type`, `status`, `deadline` ([planned columns](#planned-columns-migration-006)). A link to apply is still open |
| 16 | **Should the database also enforce the 200-character limits** (e.g. `CHECK (char_length(title) <= 200)` in a new migration)? Today only the Model checks them. | **Planned (Week 7 design): yes**, with new limits — `CHECK` constraints on `title` (3–120), `company` (1–120), `city`, `description`, `employment_type` and `status` in migration 006 |
| 17 | **Trimming:** job postings are trimmed before saving, but users and announcements are not (question 9). Should they all behave the same? | Open |
| 18 | **Applications: what happens when the applicant or the job posting is deleted?** See the [Decision](#decision-what-happens-to-applications-when-a-user-or-a-job-posting-is-deleted). | ✅ **Decided: `ON DELETE CASCADE` for both** `user_id` and `job_posting_id` (✅ implemented in migration `005_create_applications`) |
| 20 | **Status changes:** may any status change to any other (e.g. `rejected` back to `pending`)? Who may change it — the applicant, an admin? (There is no login yet, and postings have no owner who could do it.) | Open |
| 21 | **Withdrawing:** should an applicant withdraw by **deleting** the application (as planned), or with a `withdrawn` status that keeps the record? | Open |
| 22 | **Keeping history:** should job postings be **closed** (e.g. an `is_open` / status column) instead of deleted, so their applications aren't lost? | **Planned (Week 7 design):** a `status` column (`open` / `closed`); a closed posting takes no new applications. Deleting stays possible (with `CASCADE`) |
| 23 | **After an `accepted` application,** can other users still apply to that posting, and should the other applications change status? | Open |
| 24 | **Seeding applications:** should the factories and seed create sample applications? `seed:fresh`'s `TRUNCATE users, announcements, job_postings … CASCADE` empties `applications` (✅ verified). | Open — to settle with the applications factory and seed (the table exists since migration 005) |
| 25 | **With no owner, how do we know who created a posting? Is that needed?** Today `user_id` records it; after the change nothing does. Options: not needed (postings are shared by the alumni office); a separate, optional "created by" column (not an owner in the relationship sense); or an admin-only feature once there is a login. | Open |
| 26 | **Who may create, edit and delete job postings** once they have no owner? Without a login, anyone who can reach the API can. | Open |
| 27 | **`include=jobs` format** — the query parameter, and each job with an `application` object inside. See the [Decision](#decision-how-get-apiusersid-includes-a-users-jobs). | **Decision — to be confirmed.** Recommended: `?include=jobs`, with `application: { id, status, appliedAt }` on each job |
| 28 | **Naming:** "jobs" means two things — `/api/jobs` lists **all** job postings, while a user's `jobs` (`?include=jobs`) are only the postings **they applied to**. Is that clear enough, or should the include be called `appliedJobs`? | Open |
| 29 | **Keep the owner information before dropping it?** | ✅ **Settled — nothing to keep:** the real (Docker) database had never applied migration 003, so `job_postings` didn't exist there; `docker compose up` applied 003 and 004 together, and no owner data was lost |
| 30 | **Placeholder for old rows without a company:** migration 006 must set a company before adding `NOT NULL`. Chosen in this design: **`'Unknown company'`**. Alternatives: refuse to migrate until they are fixed by hand, or delete those postings. | ✅ **Decided (confirmed): `'Unknown company'`.** Planned — not implemented yet (migration 006) |
| 31 | **Old titles outside 3–120 characters:** the current Model allows 1–200. This design cuts long titles to 120 and **stops the migration** for titles under 3, listing their ids. Is cutting acceptable, and are short real titles (`"QA"`, `"PM"`) a problem for the 3-character minimum? | ✅ **Decided (confirmed):** `title` / `company` values over 120 characters are **cut to 120**; a `title` under 3 characters **stops migration 006 with the list of ids**. Planned — not implemented yet |
| 32 | **A deadline in the past on update:** the rule checks the deadline only when it is set or changed. May an update **set** a past deadline (e.g. to record when a posting really ended)? This design says no. | ✅ **Decided (confirmed):** "changed" means **different from the stored value** (re-sending the same deadline skips the check), and **an update may NOT set a past deadline** — when the deadline changes, the new value must not be in the past (400). Planned — not implemented yet |
| 33 | **What is "today"** for "not in the past" — the server's date in UTC (like the dates the pages show) or in Istanbul time? And should the seed use fixed deadlines (repeatable, but they pass with time) or deadlines relative to the day it runs? | ✅ **Decided (confirmed):** `deadline` is **read and returned as `"YYYY-MM-DD"` text**; **"today" means Istanbul time (`Europe/Istanbul`)**, so a deadline of today's Istanbul date is allowed and yesterday's is not; the **seed** gives most postings a deadline **7 to 60 days ahead** of the day it runs, and a few **no deadline**. Planned — not implemented yet |
| 34 | **Should a passed deadline close a posting automatically** (or block applications)? This design says no: the deadline is **informational only**, closing is an explicit `status: closed`. | ✅ **Decided (confirmed):** the deadline is **informational only**; **only `status: closed` blocks applications**. Planned — not implemented yet |
| 35 | **The new 400 shape** `{ "error": "validation failed", "fields": { … } }` only applies to job postings; users, announcements and applications keep `{ "error": "…" }`. Should the others move to the same shape later? | ✅ **Decided (confirmed): yes — it is the target shape for ALL APIs**, applied to every API through the **validation middleware** in a later Week 7 task. Until then, the other APIs keep `{ "error": "<message>" }`. Planned — not implemented yet |
| 36 | **No duplicate `title` + `company` + `city`?** Considered and **left out for now**: two real postings can share all three (e.g. several places for the same internship), so a unique rule would block valid data. | **Decided: left out for now** |
| 37 | **Closing a posting:** what happens to its existing applications (e.g. `pending` ones) — unchanged, as in this design, or rejected automatically? Can a closed posting be reopened (this design: yes, `status: open`)? | **Open** |
