"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import type { AnnouncementFormState } from "@/lib/views/announcements/AnnouncementCreateForm";
import type { DeleteAnnouncementState } from "@/lib/views/announcements/DeleteAnnouncementButton";

// Server Actions for the announcement pages: create, update and delete.
// When one of the forms is submitted, the browser sends a POST to the page it's on
// and Next.js runs the matching function here on the server.
// No data logic in this file: each action reads the form, calls AnnouncementController
// (which validates and calls the Announcement Model), and returns the result or redirects.

// Create: empty optional fields are left out, like when they aren't sent to the API.
function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

// Reads one text field as typed ("" if it was left empty).
function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Create (the "Add an announcement" form on /announcements).
export async function createAnnouncementAction(
  _previousState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const values = {
    title: field(formData, "title"),
    content: field(formData, "content"),
    author: field(formData, "author"),
  };

  const result = AnnouncementController.create(values);

  // Validation failed (e.g. "title" or "content" missing): show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh /announcements so the new announcement appears in the list
  revalidatePath("/announcements");
  return {
    message: `Announcement "${result.announcement.title}" created with id ${result.announcement.id}.`,
  };
}

// Update (the "Edit announcement" form on /announcements/{id}/edit). announcementId is bound
// by the form. Changes title, content and author. A cleared author is saved as ""
// (like sending it empty to PATCH /api/announcements/{id}).
export async function updateAnnouncementAction(
  announcementId: number,
  _previousState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const values = {
    title: text(formData, "title"),
    content: text(formData, "content"),
    author: text(formData, "author"),
  };

  const result = AnnouncementController.update(announcementId, values);

  // Validation failed or the announcement no longer exists: show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh the pages that show this announcement, then go to its page
  revalidatePath("/announcements");
  revalidatePath(`/announcements/${announcementId}`);
  redirect(`/announcements/${announcementId}`);
}

// Delete (the "Delete" buttons on /announcements and /announcements/{id}).
// announcementId is bound by the button.
// (The form also passes the previous state and the form data, but delete doesn't need them.)
export async function deleteAnnouncementAction(
  announcementId: number,
): Promise<DeleteAnnouncementState> {
  const result = AnnouncementController.delete(announcementId);

  // The announcement doesn't exist (e.g. already deleted elsewhere): show a message by the button
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh the list and go to it
  revalidatePath("/announcements");
  redirect("/announcements");
}
