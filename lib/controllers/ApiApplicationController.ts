// Application Controller for the JSON API side. Used by the nested routes /api/jobs/{id}/applications
// and /api/users/{id}/applications (the parent id comes from the URL), and by the direct routes
// /api/applications and /api/applications/{id}.
// Each function takes the Request (and the route params where needed), calls the Application Model,
// and returns a NextResponse.json() with the right status code.
// It never stores data itself and has no rules of its own: the rules live in the Application Model
// (validateApplication, validateStatus), and this controller only turns the Model's results into
// HTTP responses. Database errors are turned into a 400 (bad data) or a generic 500 by withDatabaseErrors.

import { NextResponse } from "next/server";
import * as ApplicationModel from "@/lib/models/application";
import type { ApplicationData, ApplicationError } from "@/lib/models/application";
import { withDatabaseErrors } from "./databaseErrors";

// The second argument Next.js passes to a route handler under a [id] folder
type IdParams = { params: Promise<{ id: string }> };

const BAD_BODY = "Request body must be JSON (application/json) or form-data";
const APPLICATION_NOT_FOUND = "Application not found";
const USER_NOT_FOUND = "User not found";
const JOB_POSTING_NOT_FOUND = "Job posting not found";
const ALREADY_APPLIED = "User already applied to this job posting";

// JSON error response with the given status code
function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

// Turns a problem reported by the Model into the matching HTTP response
function errorResponse(result: ApplicationError) {
  switch (result.error) {
    case "validation":
    case "invalid-id":
      return jsonError(result.message, 400);
    case "not-found":
      return jsonError(APPLICATION_NOT_FOUND, 404);
    case "user-not-found":
      return jsonError(USER_NOT_FOUND, 404);
    case "job-posting-not-found":
      return jsonError(JOB_POSTING_NOT_FOUND, 404);
    case "already-applied":
      return jsonError(ALREADY_APPLIED, 409);
  }
}

// Reads the request body as a plain object, from JSON or from form-data (so Postman works
// either way). Uploaded files are skipped. Returns null if the body is neither, or isn't
// a JSON object. Which fields are used, and their rules, is up to the Model.
async function readBody(request: Request): Promise<ApplicationData | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body: unknown = await request.json();
      return body !== null && typeof body === "object" && !Array.isArray(body)
        ? (body as ApplicationData)
        : null;
    }
    const formData = await request.formData();
    const fields: ApplicationData = {};
    for (const [key, value] of formData) {
      if (typeof value === "string") fields[key] = value;
    }
    return fields;
  } catch {
    return null; // not valid JSON, or not form-data (e.g. an empty or plain-text body)
  }
}

// POST /api/jobs/{id}/applications: user userId applies to job posting {id}. The body has userId
// (required) and status (optional, "pending" if left out). The job posting id comes ONLY from the
// URL: a jobPostingId (or id, createdAt, …) in the body is ignored.
// 201 with the new application, 400 for invalid data or ids, 404 if the user or the posting
// doesn't exist, or 409 if this user already applied to this posting.
export const createForJob = withDatabaseErrors(async (request: Request, { params }: IdParams) => {
  const { id } = await params;
  const body = await readBody(request);
  if (body === null) return jsonError(BAD_BODY, 400);

  const result = await ApplicationModel.createApplication({
    userId: body.userId,
    status: body.status,
    jobPostingId: id,
  });
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.application, { status: 201 });
});

// GET /api/jobs/{id}/applications: the applications to job posting {id}, newest first.
// 200 (an empty array if the posting has none), 400 for an invalid id, or 404 if the posting doesn't exist.
export const getAllForJob = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await ApplicationModel.getApplicationsByJobPostingId(id);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.applications);
});

// GET /api/users/{id}/applications: user {id}'s applications, newest first.
// 200 (an empty array if the user has none), 400 for an invalid id, or 404 if the user doesn't exist.
export const getAllForUser = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await ApplicationModel.getApplicationsByUserId(id);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.applications);
});

// GET /api/applications: returns every application, newest first (an empty array if there are none). 200.
export const getAll = withDatabaseErrors(async () => {
  const { applications } = await ApplicationModel.getAllApplications();
  return NextResponse.json(applications);
});

// GET /api/applications/{id}: returns the application (200), 400 for an invalid id, or 404.
export const getById = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await ApplicationModel.getApplicationById(id);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.application);
});

// PATCH /api/applications/{id}: changes ONLY the status (JSON or form-data). Anything else in the
// body (userId, jobPostingId, id, …) is ignored: an application's user and posting never change.
// 200 with the updated application, 400 for an invalid id or a missing / invalid status, or 404.
export const updateStatus = withDatabaseErrors(async (request: Request, { params }: IdParams) => {
  const { id } = await params;
  const body = await readBody(request);
  if (body === null) return jsonError(BAD_BODY, 400);

  const result = await ApplicationModel.updateApplicationStatus(id, body.status);
  if ("error" in result) return errorResponse(result);
  return NextResponse.json(result.application);
});

// DELETE /api/applications/{id}: removes the application. 204 with no body, 400 for an invalid id, or 404.
const remove = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const result = await ApplicationModel.deleteApplication(id);
  if (typeof result === "object") return errorResponse(result);
  if (!result) return jsonError(APPLICATION_NOT_FOUND, 404);
  return new NextResponse(null, { status: 204 });
});

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use ApiApplicationController.delete(request, context).
export { remove as delete };
