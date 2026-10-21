// Job Posting Controller for the page (view) side: the /jobs pages and their Server Actions.
// No Request / NextResponse here: functions take plain arguments, call the JobPosting Model,
// and return plain result objects ({ jobPosting } or { error }) that a page.tsx can render.
// It never stores data itself and has no rules of its own: the rules live in the JobPosting Model
// (validateJobPosting), and this controller only turns the Model's results into messages.

import * as JobPostingModel from "@/lib/models/jobPosting";
import type { JobPosting, JobPostingData } from "@/lib/models/jobPosting";
import { clientMessageFor, PAGE_ERROR } from "./databaseErrors";

export type JobPostingResult = { jobPosting: JobPosting } | { error: string };
export type JobPostingsResult = { jobPostings: JobPosting[] };
export type DeleteResult = { id: number } | { error: string };

export const notFoundMessage = (id: number | string) => `Job posting with id "${id}" not found`;

// Runs a database call; a database error becomes an { error } result the page can show
// (a clear message if the data caused it, a friendly generic one otherwise).
async function safely<T>(action: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await action();
  } catch (error) {
    return { error: clientMessageFor(error) ?? PAGE_ERROR };
  }
}

// Creates a job posting from the form's title and company. Returns { jobPosting } on success,
// or { error } with the Model's message (e.g. "title" can't be empty), or if saving failed.
export async function create(data: JobPostingData): Promise<JobPostingResult> {
  return safely(async () => {
    const result = await JobPostingModel.createJobPosting(data);
    return "error" in result ? { error: result.message } : { jobPosting: result.jobPosting };
  });
}

// Returns every job posting, newest first. (A database error here is shown by Next.js's error page.)
export async function getAll(): Promise<JobPostingsResult> {
  return JobPostingModel.getAllJobPostings();
}

// Returns { jobPosting } for this id, or { error } if the id is invalid or there is none.
export async function getById(id: number | string): Promise<JobPostingResult> {
  const result = await JobPostingModel.getJobPostingById(id);
  return "error" in result ? { error: result.message } : { jobPosting: result.jobPosting };
}

// Changes title and company. Returns { jobPosting } on success, or { error } if the id is invalid,
// the posting doesn't exist, a rule is broken (e.g. an empty title), or saving failed.
export async function update(id: number | string, data: JobPostingData): Promise<JobPostingResult> {
  return safely(async () => {
    const result = await JobPostingModel.updateJobPosting(id, data);
    return "error" in result ? { error: result.message } : { jobPosting: result.jobPosting };
  });
}

// Deletes the job posting (and, by CASCADE in the database, its applications). Returns { id } on
// success, or { error } if the id is invalid, there is none, or deleting failed.
async function remove(id: number | string): Promise<DeleteResult> {
  return safely(async () => {
    const result = await JobPostingModel.deleteJobPosting(id);
    if (typeof result === "object") return { error: result.message };
    return result ? { id: Number(id) } : { error: notFoundMessage(id) };
  });
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use JobPostingController.delete(id).
export { remove as delete };
