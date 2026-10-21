// Job Posting Controller for the JSON API side (used by the /api/jobs and /api/jobs/{id} routes).
// Job postings have no owner: users and postings are linked only through applications (a later task).
// Each function takes the Request (and the route params where needed), calls the JobPosting Model,
// and returns a NextResponse.json() with the right status code.
// It never stores data itself and has no rules of its own: the rules live in the JobPosting Model
// (validateJobPosting), and this controller only turns the Model's results into HTTP responses.
// Database errors are turned into a 400 (bad data) or a generic 500 by withDatabaseErrors.

import { NextResponse } from "next/server";
import * as JobPostingModel from "@/lib/models/jobPosting";
import type { JobPostingData, JobPostingError } from "@/lib/models/jobPosting";
import { withDatabaseErrors } from "./databaseErrors";

// The second argument Next.js passes to a route handler under app/api/jobs/[id]/
type IdParams = { params: Promise<{ id: string }> };

const BAD_BODY = "Request body must be JSON (application/json) or form-data";
const JOB_POSTING_NOT_FOUND = "Job posting not found";

// JSON error response with the given status code
function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

// Turns a problem reported by the Model into the matching HTTP response
function errorResponse(result: JobPostingError) {
  switch (result.error) {
    case "validation":
    case "invalid-id":
      return jsonError(result.message, 400);
    case "not-found":
      return jsonError(JOB_POSTING_NOT_FOUND, 404);
  }
}

// Reads the request body as a plain object, from JSON or from form-data (so Postman works
// either way). Uploaded files are skipped. Returns null if the body is neither, or isn't
// a JSON object. Which fields are used, and their rules, is up to the Model.
async function readBody(request: Request): Promise<JobPostingData | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body: unknown = await request.json();
      return body !== null && typeof body === "object" && !Array.isArray(body)
        ? (body as JobPostingData)
        : null;
    }
    const formData = await request.formData();
    const fields: JobPostingData = {};
    for (const [key, value] of formData) {
      if (typeof value === "string") fields[key] = value;
    }
    return fields;
  } catch {
    return null; // not valid JSON, or not form-data (e.g. an empty or plain-text body)
  }
}

// POST /api/jobs: creates a job posting from the body (JSON or form-data): title (required) and
// company. Any id, userId or createdAt in the body is ignored. 201 with the new posting, or 400 for
// invalid data or a body that isn't JSON / form-data.
export const create = withDatabaseErrors(async (request: Request) => {
  const body = await readBody(request);
  if (body === null) return jsonError(BAD_BODY, 400);

  const result = await JobPostingModel.createJobPosting(body);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.jobPosting, { status: 201 });
});

// GET /api/jobs: returns every job posting, newest first (an empty array if there are none). 200.
export const getAll = withDatabaseErrors(async () => {
  const { jobPostings } = await JobPostingModel.getAllJobPostings();
  return NextResponse.json(jobPostings);
});

// GET /api/jobs/{id}: returns the posting (200), 400 for an invalid id, or 404.
export const getById = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await JobPostingModel.getJobPostingById(id);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.jobPosting);
});

// PATCH /api/jobs/{id}: changes only the fields sent (title and/or company, as JSON or
// form-data) and keeps the rest; any other field in the body is ignored.
// 200 with the updated posting, 400 for an invalid id or invalid data, or 404.
export const update = withDatabaseErrors(async (request: Request, { params }: IdParams) => {
  const { id } = await params;
  const body = await readBody(request);
  if (body === null) return jsonError(BAD_BODY, 400);

  const result = await JobPostingModel.updateJobPosting(id, body);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.jobPosting);
});

// DELETE /api/jobs/{id}: removes the posting. 204 with no body, 400 for an invalid id, or 404.
const remove = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await JobPostingModel.deleteJobPosting(id);
  if (typeof result === "object") return errorResponse(result);
  if (!result) return jsonError(JOB_POSTING_NOT_FOUND, 404);
  return new NextResponse(null, { status: 204 });
});

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use ApiJobPostingController.delete(request, context).
export { remove as delete };
