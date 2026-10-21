"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import type { ApplicationFormState } from "@/lib/views/applications/ApplicationCreateForm";
import type { DeleteApplicationState } from "@/lib/views/applications/DeleteApplicationButton";
import type { DeleteJobPostingState } from "@/lib/views/jobs/DeleteJobPostingButton";
import type { JobPostingFormState } from "@/lib/views/jobs/JobPostingCreateForm";

// Server Actions for the job posting pages: create, update and delete a posting, and add,
// change the status of, and remove an application on a posting's page.
// When one of the forms is submitted, the browser sends a POST to the page it's on
// and Next.js runs the matching function here on the server.
// No data logic in this file: each action reads the form, calls JobPostingController or
// ApplicationController (which call the Models, where the rules live), and returns the result or redirects.

// Reads one text field as typed ("" if it was left empty).
function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Reads one field, or undefined if it wasn't sent or was left empty (e.g. no user chosen).
function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value !== "" ? value : undefined;
}

// ---- Job postings ----------------------------------------------------------------------------

// Create (the form on /jobs/new). The JobPosting Model trims both fields; an empty company is saved
// as "no company".
export async function createJobPostingAction(
  _previousState: JobPostingFormState,
  formData: FormData,
): Promise<JobPostingFormState> {
  const values = { title: text(formData, "title"), company: text(formData, "company") };

  const result = await JobPostingController.create(values);

  // Validation failed (e.g. an empty title): show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh /jobs so the new posting appears in the list, then go to its page
  revalidatePath("/jobs");
  redirect(`/jobs/${result.jobPosting.id}`);
}

// Update (the "Edit job posting" form on /jobs/{id}/edit). jobPostingId is bound by the form.
// Changes title and company; a cleared company removes it.
export async function updateJobPostingAction(
  jobPostingId: number,
  _previousState: JobPostingFormState,
  formData: FormData,
): Promise<JobPostingFormState> {
  const values = { title: text(formData, "title"), company: text(formData, "company") };

  const result = await JobPostingController.update(jobPostingId, values);

  // Validation failed or the posting no longer exists: show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh the pages that show this posting, then go to its page
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobPostingId}`);
  redirect(`/jobs/${jobPostingId}`);
}

// Delete (the "Delete" buttons on /jobs, /jobs/{id} and /jobs/{id}/edit). jobPostingId is bound by
// the button. The database also deletes the posting's applications (ON DELETE CASCADE).
// (The form also passes the previous state and the form data, but delete doesn't need them.)
export async function deleteJobPostingAction(jobPostingId: number): Promise<DeleteJobPostingState> {
  const result = await JobPostingController.delete(jobPostingId);

  // The posting doesn't exist (e.g. already deleted elsewhere): show a message by the button
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh the list (and the users' pages, which listed its applications) and go to it
  revalidatePath("/jobs");
  revalidatePath("/users/[id]", "page");
  redirect("/jobs");
}

// ---- Applications (the Applications section on /jobs/{id}) -----------------------------------

// Add (the "Add application" form). jobPostingId is bound by the form; the user comes from the dropdown.
export async function createApplicationAction(
  jobPostingId: number,
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const result = await ApplicationController.createForJob(jobPostingId, field(formData, "userId"));

  // No user chosen, user or posting gone, or already applied: show the error in the form
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh this posting's page and the applicant's page
  revalidatePath(`/jobs/${jobPostingId}`);
  revalidatePath(`/users/${result.application.userId}`);
  return { message: "Application added." };
}

// Change the status (the status form in each row). applicationId is bound by the form.
export async function updateApplicationStatusAction(
  applicationId: number,
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const result = await ApplicationController.updateStatus(applicationId, field(formData, "status"));

  // Status not allowed, or the application no longer exists: show the error by the form
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh the posting's page and the applicant's page
  revalidatePath(`/jobs/${result.application.jobPostingId}`);
  revalidatePath(`/users/${result.application.userId}`);
  return {};
}

// Remove (the "Remove" button in each row). applicationId is bound by the button.
// (The form also passes the previous state and the form data, but delete doesn't need them.)
export async function deleteApplicationAction(
  applicationId: number,
): Promise<DeleteApplicationState> {
  const result = await ApplicationController.delete(applicationId);

  // The application doesn't exist (e.g. already removed elsewhere): show a message by the button
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh the job posting pages and the users' pages that listed it
  revalidatePath("/jobs/[id]", "page");
  revalidatePath("/users/[id]", "page");
  return {};
}
