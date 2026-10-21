// Application Model (the "M" in MVC).
// Owns the application data, its rules, and the only functions allowed to read or change it.
// Stored in PostgreSQL (table "applications", created by migrations/005_create_applications.up.sql)
// and accessed with plain, parameterized SQL through lib/db.ts — no ORM. No HTTP or Next.js code here.
//
// An application is one user's application to one job posting: the applications table is the join
// table that links users and job postings (many-to-many, see ddd.md). It can only change its status;
// its user and job posting are fixed once it is created.
//
// Like the JobPosting model, the rules (validation) live here, and every function reports problems
// as a result object instead of undefined, so a controller can tell them apart:
//   { error: "validation" }            → the data breaks a rule, e.g. a bad status (→ 400)
//   { error: "invalid-id" }            → an id that can't match a row, e.g. "abc" (→ 400)
//   { error: "not-found" }             → the application doesn't exist (→ 404)
//   { error: "user-not-found" }        → the user doesn't exist (→ 404)
//   { error: "job-posting-not-found" } → the job posting doesn't exist (→ 404)
//   { error: "already-applied" }       → this user already applied to this posting (→ 409)

import { query } from "@/lib/db";

// The allowed statuses, in one place (the same list as the CHECK in migration 005)
export const APPLICATION_STATUSES = ["pending", "accepted", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// A new application gets this status when none is sent (the same default as the table)
export const DEFAULT_STATUS: ApplicationStatus = "pending";

// A stored application.
// createdAt and updatedAt are ISO date strings (e.g. "2026-10-10T09:30:00.000Z"), set by the database.
export type Application = {
  id: number;
  userId: number;
  jobPostingId: number;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

// Data sent to create an application (e.g. form fields). Only userId, jobPostingId and status are
// used; any other field — id, createdAt, updatedAt, … — is ignored.
export type ApplicationData = {
  userId?: unknown;
  jobPostingId?: unknown;
  status?: unknown;
  [field: string]: unknown;
};

// The clean values after validation
type CleanApplicationData = { userId: number; jobPostingId: number; status: ApplicationStatus };

// Problems a function can report instead of a result
export type ApplicationError =
  | { error: "validation"; message: string }
  | { error: "invalid-id"; message: string }
  | { error: "not-found"; message: string }
  | { error: "user-not-found"; message: string }
  | { error: "job-posting-not-found"; message: string }
  | { error: "already-applied"; message: string };

export type ApplicationResult = { application: Application } | ApplicationError;
export type ApplicationListResult = { applications: Application[] } | ApplicationError;

// The names migration 005 gives the constraints, used to tell database errors apart
const USER_FOREIGN_KEY = "applications_user_id_fkey";
const JOB_POSTING_FOREIGN_KEY = "applications_job_posting_id_fkey";
const UNIQUE_USER_AND_JOB_POSTING = "applications_user_id_job_posting_id_key";

// A row of the applications table, as pg returns it (bigint as a string, timestamptz as a Date)
type ApplicationRow = {
  id: string;
  user_id: string;
  job_posting_id: string;
  status: ApplicationStatus;
  created_at: Date;
  updated_at: Date;
};

// The columns every query returns
const COLUMNS = "id, user_id, job_posting_id, status, created_at, updated_at";

// Turns a database row into the camelCase Application the rest of the app uses.
function toApplication(row: ApplicationRow): Application {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    jobPostingId: Number(row.job_posting_id),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// ---- Rules -----------------------------------------------------------------------------------

// Turns an id from a URL, a form or JSON into a whole number, or null if it can't match a row
// (e.g. "abc", "1.5", "-2", 0, true, or a number too large to be an id).
function parseId(id: unknown): number | null {
  const n =
    typeof id === "number" ? id : typeof id === "string" && /^\d+$/.test(id) ? Number(id) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

const invalidId = (label: string, id: unknown) => ({
  error: "invalid-id" as const,
  message: `${label} id "${String(id)}" is not a valid number`,
});
const applicationNotFound = (id: unknown): ApplicationError => ({
  error: "not-found",
  message: `Application with id "${String(id)}" not found`,
});
const userNotFound = (id: unknown): ApplicationError => ({
  error: "user-not-found",
  message: `User with id "${String(id)}" not found`,
});
const jobPostingNotFound = (id: unknown): ApplicationError => ({
  error: "job-posting-not-found",
  message: `Job posting with id "${String(id)}" not found`,
});
const alreadyApplied = (userId: number, jobPostingId: number): ApplicationError => ({
  error: "already-applied",
  message: `User ${userId} has already applied to job posting ${jobPostingId}`,
});

// The status rule: exactly one of APPLICATION_STATUSES (no trimming, no other spelling).
export function validateStatus(
  status: unknown,
): { status: ApplicationStatus } | { error: "validation"; message: string } {
  if (typeof status === "string" && (APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return { status: status as ApplicationStatus };
  }
  return {
    error: "validation",
    message: `"status" must be one of: ${APPLICATION_STATUSES.join(", ")}`,
  };
}

// The application rules, in one place. createApplication uses this function.
//   - userId and jobPostingId: required; each must be a whole number greater than 0
//     (a missing one is a validation error, any other bad value an invalid-id result)
//   - status: optional, DEFAULT_STATUS if left out; if sent it must pass validateStatus
// Whether the user and the posting exist, and whether the user already applied, is checked by
// the database (foreign keys and the unique rule), so two requests at once can't get around it.
// Returns the clean values, or a validation / invalid-id error with a clear message.
export function validateApplication(
  data: ApplicationData,
): { data: CleanApplicationData } | ApplicationError {
  if (data.userId === undefined) return { error: "validation", message: '"userId" is required' };
  const userId = parseId(data.userId);
  if (userId === null) return invalidId("User", data.userId);

  if (data.jobPostingId === undefined) {
    return { error: "validation", message: '"jobPostingId" is required' };
  }
  const jobPostingId = parseId(data.jobPostingId);
  if (jobPostingId === null) return invalidId("Job posting", data.jobPostingId);

  let status = DEFAULT_STATUS;
  if (data.status !== undefined) {
    const valid = validateStatus(data.status);
    if ("error" in valid) return valid;
    status = valid.status;
  }

  return { data: { userId, jobPostingId, status } };
}

// Real database errors are never swallowed: log them on the server and throw them on,
// so the controller can turn them into a 500 (like errors from the other models).
function logAndRethrow(error: unknown): never {
  console.error("Application model database error:", error);
  throw error;
}

// The PostgreSQL error code and constraint name of a database error (both undefined otherwise)
function databaseErrorOf(error: unknown): { code?: unknown; constraint?: unknown } {
  return typeof error === "object" && error !== null ? error : {};
}

// ---- CRUD ------------------------------------------------------------------------------------

// Adds a new application (the database assigns the id and sets createdAt / updatedAt) and returns it.
// The database is the real protection: its foreign keys reject a missing user or posting (23503),
// and its unique rule rejects a second application by the same user to the same posting (23505),
// even when two requests arrive at the same time. Those errors become clear results here.
export async function createApplication(data: ApplicationData): Promise<ApplicationResult> {
  const valid = validateApplication(data);
  if ("error" in valid) return valid;
  const { userId, jobPostingId, status } = valid.data;

  try {
    const [row] = await query<ApplicationRow>(
      `INSERT INTO applications (user_id, job_posting_id, status)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNS}`,
      [userId, jobPostingId, status],
    );
    return { application: toApplication(row) };
  } catch (error) {
    const { code, constraint } = databaseErrorOf(error);
    if (code === "23503" && constraint === USER_FOREIGN_KEY) return userNotFound(userId);
    if (code === "23503" && constraint === JOB_POSTING_FOREIGN_KEY) {
      return jobPostingNotFound(jobPostingId);
    }
    if (code === "23505" && constraint === UNIQUE_USER_AND_JOB_POSTING) {
      return alreadyApplied(userId, jobPostingId);
    }
    logAndRethrow(error);
  }
}

// Returns every application, newest first (an empty list if there are none).
export async function getAllApplications(): Promise<{ applications: Application[] }> {
  try {
    const rows = await query<ApplicationRow>(
      `SELECT ${COLUMNS} FROM applications ORDER BY created_at DESC, id DESC`,
    );
    return { applications: rows.map(toApplication) };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns the applications to one job posting (its applicants), newest first, or
// "job-posting-not-found" if the posting doesn't exist. A posting with no applications gives [].
export async function getApplicationsByJobPostingId(
  jobPostingId: number | string,
): Promise<ApplicationListResult> {
  const postingId = parseId(jobPostingId);
  if (postingId === null) return invalidId("Job posting", jobPostingId);

  try {
    const posting = await query("SELECT 1 FROM job_postings WHERE id = $1", [postingId]);
    if (posting.length === 0) return jobPostingNotFound(jobPostingId);

    const rows = await query<ApplicationRow>(
      `SELECT ${COLUMNS} FROM applications
       WHERE job_posting_id = $1
       ORDER BY created_at DESC, id DESC`,
      [postingId],
    );
    return { applications: rows.map(toApplication) };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns one user's applications (what they applied to), newest first, or "user-not-found"
// if the user doesn't exist. A user with no applications gives [].
export async function getApplicationsByUserId(
  userId: number | string,
): Promise<ApplicationListResult> {
  const applicantId = parseId(userId);
  if (applicantId === null) return invalidId("User", userId);

  try {
    const user = await query("SELECT 1 FROM users WHERE id = $1", [applicantId]);
    if (user.length === 0) return userNotFound(userId);

    const rows = await query<ApplicationRow>(
      `SELECT ${COLUMNS} FROM applications
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [applicantId],
    );
    return { applications: rows.map(toApplication) };
  } catch (error) {
    logAndRethrow(error);
  }
}

// ---- Read-only joins for the pages ------------------------------------------------------------
// The pages show names and titles, not just ids. These two functions only READ (no rules of their
// own): they return the same applications as getApplicationsByJobPostingId / getApplicationsByUserId,
// each joined with its user or its job posting, with the same id checks and "not found" results.

// An application together with its applicant (for a job posting's page)
export type ApplicationWithUser = Application & { user: { id: number; name: string; email?: string } };

// An application together with the job posting applied to (for a user's page)
export type ApplicationWithJobPosting = Application & {
  jobPosting: { id: number; title: string; company?: string };
};

// The application columns, prefixed for queries that join another table
const JOINED_COLUMNS =
  "a.id, a.user_id, a.job_posting_id, a.status, a.created_at, a.updated_at";

// Returns the applications to one job posting, each with its applicant's id, name and email,
// newest first, or "job-posting-not-found" if the posting doesn't exist.
export async function getApplicationsWithUsersByJobPostingId(
  jobPostingId: number | string,
): Promise<{ applications: ApplicationWithUser[] } | ApplicationError> {
  const postingId = parseId(jobPostingId);
  if (postingId === null) return invalidId("Job posting", jobPostingId);

  try {
    const posting = await query("SELECT 1 FROM job_postings WHERE id = $1", [postingId]);
    if (posting.length === 0) return jobPostingNotFound(jobPostingId);

    const rows = await query<ApplicationRow & { user_name: string; user_email: string | null }>(
      `SELECT ${JOINED_COLUMNS}, u.name AS user_name, u.email AS user_email
       FROM applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.job_posting_id = $1
       ORDER BY a.created_at DESC, a.id DESC`,
      [postingId],
    );
    return {
      applications: rows.map((row) => ({
        ...toApplication(row),
        user: {
          id: Number(row.user_id),
          name: row.user_name,
          ...(row.user_email !== null && { email: row.user_email }),
        },
      })),
    };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns one user's applications, each with the job posting's id, title and company,
// newest first, or "user-not-found" if the user doesn't exist.
export async function getApplicationsWithJobPostingsByUserId(
  userId: number | string,
): Promise<{ applications: ApplicationWithJobPosting[] } | ApplicationError> {
  const applicantId = parseId(userId);
  if (applicantId === null) return invalidId("User", userId);

  try {
    const user = await query("SELECT 1 FROM users WHERE id = $1", [applicantId]);
    if (user.length === 0) return userNotFound(userId);

    const rows = await query<ApplicationRow & { job_title: string; job_company: string | null }>(
      `SELECT ${JOINED_COLUMNS}, j.title AS job_title, j.company AS job_company
       FROM applications a
       JOIN job_postings j ON j.id = a.job_posting_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC, a.id DESC`,
      [applicantId],
    );
    return {
      applications: rows.map((row) => ({
        ...toApplication(row),
        jobPosting: {
          id: Number(row.job_posting_id),
          title: row.job_title,
          ...(row.job_company !== null && { company: row.job_company }),
        },
      })),
    };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns the application with this id, or "not-found".
export async function getApplicationById(id: number | string): Promise<ApplicationResult> {
  const applicationId = parseId(id);
  if (applicationId === null) return invalidId("Application", id);

  try {
    const [row] = await query<ApplicationRow>(
      `SELECT ${COLUMNS} FROM applications WHERE id = $1`,
      [applicationId],
    );
    return row ? { application: toApplication(row) } : applicationNotFound(id);
  } catch (error) {
    logAndRethrow(error);
  }
}

// Changes ONLY the status and refreshes updatedAt. The user and the job posting can never be
// changed: this function takes no other field, and the SQL only sets status and updated_at.
// Returns the updated application or an error result.
export async function updateApplicationStatus(
  id: number | string,
  status: unknown,
): Promise<ApplicationResult> {
  const applicationId = parseId(id);
  if (applicationId === null) return invalidId("Application", id);

  const valid = validateStatus(status);
  if ("error" in valid) return valid;

  try {
    const [row] = await query<ApplicationRow>(
      `UPDATE applications SET
         status     = $2,
         updated_at = now()
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [applicationId, valid.status],
    );
    return row ? { application: toApplication(row) } : applicationNotFound(id);
  } catch (error) {
    logAndRethrow(error);
  }
}

// Removes the application. Returns true if it was deleted, false if no application had this id
// (or an invalid-id result for an id like "abc").
export async function deleteApplication(
  id: number | string,
): Promise<boolean | { error: "invalid-id"; message: string }> {
  const applicationId = parseId(id);
  if (applicationId === null) return invalidId("Application", id);

  try {
    const rows = await query("DELETE FROM applications WHERE id = $1 RETURNING id", [
      applicationId,
    ]);
    return rows.length > 0;
  } catch (error) {
    logAndRethrow(error);
  }
}
