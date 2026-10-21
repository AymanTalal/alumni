// JobPosting Model (the "M" in MVC).
// Owns the job posting data, its rules, and the only functions allowed to read or change it.
// Stored in PostgreSQL (table "job_postings", created by migrations/003_create_job_postings.up.sql;
// its owner column was removed by migrations/004_drop_job_postings_user_id.up.sql) and accessed
// with plain, parameterized SQL through lib/db.ts — no ORM. No HTTP or Next.js code here.
//
// A job posting has NO owner (see ddd.md): users and job postings are linked only through the
// applications join table (many-to-many), which comes in a later task.
//
// Unlike the User and Announcement models, the rules (validation) live here, and every function
// reports problems as a result object instead of undefined, so a controller can tell them apart:
//   { error: "validation" } → the data breaks a rule (→ 400)
//   { error: "invalid-id" } → an id that can't match a row, e.g. "abc" (→ 400)
//   { error: "not-found" }  → the posting doesn't exist (→ 404)

import { query } from "@/lib/db";

// A stored job posting. "title" is required, "company" is optional.
// createdAt and updatedAt are ISO date strings (e.g. "2026-10-10T09:30:00.000Z"), set by the database.
export type JobPosting = {
  id: number;
  title: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
};

// Data sent to create or update a posting (e.g. form fields). Only title and company are used;
// any other field — id, userId, createdAt, … — is ignored.
export type JobPostingData = { title?: unknown; company?: unknown; [field: string]: unknown };

// The clean values after validation (title trimmed; company trimmed, or null to leave it empty)
type CleanJobPostingData = { title?: string; company?: string | null };

// Problems a function can report instead of a result
export type JobPostingError =
  | { error: "validation"; message: string }
  | { error: "invalid-id"; message: string }
  | { error: "not-found"; message: string };

export type JobPostingResult = { jobPosting: JobPosting } | JobPostingError;

// Rule limits
export const TITLE_MAX_LENGTH = 200;
export const COMPANY_MAX_LENGTH = 200;

// A row of the job_postings table, as pg returns it (bigint as a string, timestamptz as a Date)
type JobPostingRow = {
  id: string;
  title: string;
  company: string | null;
  created_at: Date;
  updated_at: Date;
};

// The columns every query returns
const COLUMNS = "id, title, company, created_at, updated_at";

// Turns a database row into the camelCase JobPosting the rest of the app uses.
// An empty (NULL) company is left out, like a field that was never sent.
function toJobPosting(row: JobPostingRow): JobPosting {
  const jobPosting: JobPosting = {
    id: Number(row.id),
    title: row.title,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
  if (row.company !== null) jobPosting.company = row.company;
  return jobPosting;
}

// ---- Rules -----------------------------------------------------------------------------------

// The job posting rules, in one place. Create and update both use this function.
//   - title: required on create; on update it may be left out, but if sent it must be a
//     non-empty string after trimming, at most TITLE_MAX_LENGTH characters
//   - company: optional; if sent it must be a string, at most COMPANY_MAX_LENGTH characters
//     after trimming; an empty company means "no company" (stored as NULL)
// Returns the trimmed values, or a validation error with a clear message.
export function validateJobPosting(
  data: JobPostingData,
  { partial }: { partial: boolean },
): { data: CleanJobPostingData } | { error: "validation"; message: string } {
  const clean: CleanJobPostingData = {};
  const invalid = (message: string) => ({ error: "validation" as const, message });

  if (data.title === undefined) {
    if (!partial) return invalid('"title" is required');
  } else {
    if (typeof data.title !== "string") return invalid('"title" must be text');
    const title = data.title.trim();
    if (title === "") return invalid('"title" can\'t be empty');
    if (title.length > TITLE_MAX_LENGTH) {
      return invalid(`"title" can be at most ${TITLE_MAX_LENGTH} characters`);
    }
    clean.title = title;
  }

  if (data.company !== undefined && data.company !== null) {
    if (typeof data.company !== "string") return invalid('"company" must be text');
    const company = data.company.trim();
    if (company.length > COMPANY_MAX_LENGTH) {
      return invalid(`"company" can be at most ${COMPANY_MAX_LENGTH} characters`);
    }
    clean.company = company === "" ? null : company;
  } else if (data.company === null) {
    clean.company = null;
  }

  return { data: clean };
}

// Turns an id from a URL or a number into a whole number, or null if it can't match a row
// (e.g. "abc", "1.5", "-2", 0, or a number too large to be an id).
function parseId(id: number | string): number | null {
  const n = typeof id === "number" ? id : /^\d+$/.test(id) ? Number(id) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

const invalidId = (id: number | string) => ({
  error: "invalid-id" as const,
  message: `Job posting id "${id}" is not a valid number`,
});
const postingNotFound = (id: number | string): JobPostingError => ({
  error: "not-found",
  message: `Job posting with id "${id}" not found`,
});

// Real database errors are never swallowed: log them on the server and throw them on,
// so the controller can turn them into a 500 (like errors from the other models).
function logAndRethrow(error: unknown): never {
  console.error("JobPosting model database error:", error);
  throw error;
}

// ---- CRUD ------------------------------------------------------------------------------------

// Adds a new posting (the database assigns the id and sets createdAt / updatedAt) and returns it.
export async function createJobPosting(data: JobPostingData): Promise<JobPostingResult> {
  const valid = validateJobPosting(data, { partial: false });
  if ("error" in valid) return valid;

  try {
    const [row] = await query<JobPostingRow>(
      `INSERT INTO job_postings (title, company)
       VALUES ($1, $2)
       RETURNING ${COLUMNS}`,
      [valid.data.title, valid.data.company ?? null],
    );
    return { jobPosting: toJobPosting(row) };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns every job posting, newest first (an empty list if there are none).
export async function getAllJobPostings(): Promise<{ jobPostings: JobPosting[] }> {
  try {
    const rows = await query<JobPostingRow>(
      `SELECT ${COLUMNS} FROM job_postings ORDER BY created_at DESC, id DESC`,
    );
    return { jobPostings: rows.map(toJobPosting) };
  } catch (error) {
    logAndRethrow(error);
  }
}

// Returns the posting with this id, or "not-found".
export async function getJobPostingById(id: number | string): Promise<JobPostingResult> {
  const postingId = parseId(id);
  if (postingId === null) return invalidId(id);

  try {
    const [row] = await query<JobPostingRow>(`SELECT ${COLUMNS} FROM job_postings WHERE id = $1`, [
      postingId,
    ]);
    return row ? { jobPosting: toJobPosting(row) } : postingNotFound(id);
  } catch (error) {
    logAndRethrow(error);
  }
}

// Changes only the fields given (title and/or company), keeps the rest, and refreshes updatedAt.
// Returns the updated posting or an error result.
// Each column gets a "was it sent?" flag, so the SQL text never changes.
export async function updateJobPosting(
  id: number | string,
  partialData: JobPostingData,
): Promise<JobPostingResult> {
  const postingId = parseId(id);
  if (postingId === null) return invalidId(id);

  const valid = validateJobPosting(partialData, { partial: true });
  if ("error" in valid) return valid;
  const { title, company } = valid.data;

  try {
    const [row] = await query<JobPostingRow>(
      `UPDATE job_postings SET
         title      = CASE WHEN $2 THEN $3 ELSE title END,
         company    = CASE WHEN $4 THEN $5 ELSE company END,
         updated_at = now()
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [postingId, title !== undefined, title ?? null, company !== undefined, company ?? null],
    );
    return row ? { jobPosting: toJobPosting(row) } : postingNotFound(id);
  } catch (error) {
    logAndRethrow(error);
  }
}

// Removes the posting. Returns true if it was deleted, false if no posting had this id
// (or an invalid-id result for an id like "abc").
export async function deleteJobPosting(
  id: number | string,
): Promise<boolean | { error: "invalid-id"; message: string }> {
  const postingId = parseId(id);
  if (postingId === null) return invalidId(id);

  try {
    const rows = await query("DELETE FROM job_postings WHERE id = $1 RETURNING id", [postingId]);
    return rows.length > 0;
  } catch (error) {
    logAndRethrow(error);
  }
}
