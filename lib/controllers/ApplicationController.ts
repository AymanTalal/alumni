// Application Controller for the page (view) side: the Applications sections on /jobs/{id} and
// /users/{id}, and their Server Actions.
// No Request / NextResponse here: functions take plain arguments, call the Application Model,
// and return plain result objects ({ application(s) } or { error }) that a page.tsx can render.
// It never stores data itself and has no rules of its own: the rules live in the Application Model
// (validateApplication, validateStatus), and this controller only turns the Model's results into messages.

import * as ApplicationModel from "@/lib/models/application";
import type {
  Application,
  ApplicationError,
  ApplicationWithDetails,
  ApplicationWithJobPosting,
  ApplicationWithUser,
} from "@/lib/models/application";
import { clientMessageFor, PAGE_ERROR } from "./databaseErrors";

export type ApplicationResult = { application: Application } | { error: string };
export type DeleteResult = { id: number } | { error: string };

// The statuses an application can have, for the pages' dropdowns (the list itself lives in the Model)
export const STATUSES = ApplicationModel.APPLICATION_STATUSES;

// Same text as the JSON API's 409 answer
export const ALREADY_APPLIED = "User already applied to this job posting";

// Turns a problem reported by the Model into the message the page shows
function messageFor(result: ApplicationError): string {
  return result.error === "already-applied" ? ALREADY_APPLIED : result.message;
}

// Runs a database call; a database error becomes an { error } result the page can show
// (a clear message if the data caused it, a friendly generic one otherwise).
async function safely<T>(action: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await action();
  } catch (error) {
    return { error: clientMessageFor(error) ?? PAGE_ERROR };
  }
}

// User userId applies to job posting jobPostingId (status "pending"). Returns { application }, or
// { error } if no user was chosen, the user or posting doesn't exist, the user already applied, or saving failed.
export async function createForJob(
  jobPostingId: number | string,
  userId: string | undefined,
): Promise<ApplicationResult> {
  return safely(async () => {
    const result = await ApplicationModel.createApplication({ userId, jobPostingId });
    return "error" in result ? { error: messageFor(result) } : { application: result.application };
  });
}

// The applications to one job posting, each with its applicant's name and email, newest first.
// Returns { error } if the id is invalid or the posting doesn't exist.
export async function getAllForJob(
  jobPostingId: number | string,
): Promise<{ applications: ApplicationWithUser[] } | { error: string }> {
  const result = await ApplicationModel.getApplicationsWithUsersByJobPostingId(jobPostingId);
  return "error" in result ? { error: messageFor(result) } : result;
}

// One user's applications, each with the job posting's title and company, newest first.
// Returns { error } if the id is invalid or the user doesn't exist.
export async function getAllForUser(
  userId: number | string,
): Promise<{ applications: ApplicationWithJobPosting[] } | { error: string }> {
  const result = await ApplicationModel.getApplicationsWithJobPostingsByUserId(userId);
  return "error" in result ? { error: messageFor(result) } : result;
}

// Every application, each with its applicant's name and email and its job posting's title and
// company, newest first. (A database error here is shown by Next.js's error page.)
export async function getAll(): Promise<{ applications: ApplicationWithDetails[] }> {
  return ApplicationModel.getAllApplicationsWithDetails();
}

// Changes only the status. Returns { application } on success, or { error } if the id is invalid,
// the application doesn't exist, the status isn't allowed, or saving failed.
export async function updateStatus(
  id: number | string,
  status: string | undefined,
): Promise<ApplicationResult> {
  return safely(async () => {
    const result = await ApplicationModel.updateApplicationStatus(id, status);
    return "error" in result ? { error: messageFor(result) } : { application: result.application };
  });
}

// Deletes the application. Returns { id } on success,
// or { error } if the id is invalid, there is none, or deleting failed.
async function remove(id: number | string): Promise<DeleteResult> {
  return safely(async () => {
    const result = await ApplicationModel.deleteApplication(id);
    if (typeof result === "object") return { error: result.message };
    return result ? { id: Number(id) } : { error: `Application with id "${id}" not found` };
  });
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use ApplicationController.delete(id).
export { remove as delete };
