// Announcement Controller for the page (view) side, e.g. a future announcements list or detail page.
// No Request / NextResponse here: functions take plain arguments, call the Announcement Model,
// and return plain result objects ({ announcement } or { error }) that a page.tsx can render.
// It never stores data itself; all data access goes through lib/models/announcement.ts (PostgreSQL).

import * as AnnouncementModel from "@/lib/models/announcement";
import type {
  Announcement,
  AnnouncementData,
  PartialAnnouncementData,
} from "@/lib/models/announcement";
import { clientMessageFor, PAGE_ERROR } from "./databaseErrors";

export type AnnouncementResult = { announcement: Announcement } | { error: string };
export type AnnouncementsResult = { announcements: Announcement[] };
export type DeleteResult = { id: number } | { error: string };

// Error messages shared with ApiAnnouncementController, so both sides report the same thing.
export const TITLE_REQUIRED = '"title" is required and must be a non-empty string';
export const CONTENT_REQUIRED = '"content" is required and must be a non-empty string';
export const invalidIdMessage = (id: number | string) =>
  `Announcement id "${id}" is not a valid number`;
export const notFoundMessage = (id: number | string) => `Announcement with id "${id}" not found`;

// Validation rule shared with ApiAnnouncementController: "title" and "content" must be
// non-empty strings. When required is false (partial updates), they may be left out,
// but can't be blank if given. Returns the first error message, or null if the data is valid.
export function validateAnnouncement(
  data: { title?: unknown; content?: unknown },
  required: boolean,
): string | null {
  const checks: [unknown, string][] = [
    [data.title, TITLE_REQUIRED],
    [data.content, CONTENT_REQUIRED],
  ];
  for (const [value, message] of checks) {
    if (value === undefined) {
      if (required) return message;
    } else if (typeof value !== "string" || value.trim() === "") {
      return message;
    }
  }
  return null;
}

// Turns an id from a URL or form ("3") into a number. Returns null if it isn't a whole,
// non-negative number (e.g. "abc", "1.5", "-2"), so callers can report an invalid id.
export function parseId(id: number | string): number | null {
  if (typeof id === "number") return Number.isInteger(id) && id >= 0 ? id : null;
  return /^\d+$/.test(id) ? Number(id) : null;
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

// Creates an announcement. Returns { announcement } on success,
// or { error } if "title" or "content" is missing or blank, or saving failed.
export async function create(data: Partial<AnnouncementData>): Promise<AnnouncementResult> {
  const error = validateAnnouncement(data, true);
  if (error) return { error };

  return safely(async () => ({
    announcement: await AnnouncementModel.createAnnouncement(data as AnnouncementData),
  }));
}

// Returns every announcement, newest first. (A database error here is shown by Next.js's error page.)
export async function getAll(): Promise<AnnouncementsResult> {
  return { announcements: await AnnouncementModel.getAllAnnouncements() };
}

// Returns { announcement } for this id, or { error } if the id is invalid or there is none.
export async function getById(id: number | string): Promise<AnnouncementResult> {
  const numericId = parseId(id);
  if (numericId === null) return { error: invalidIdMessage(id) };

  const announcement = await AnnouncementModel.getAnnouncementById(numericId);
  return announcement ? { announcement } : { error: notFoundMessage(id) };
}

// Changes only the given fields. Returns { announcement } on success, or { error } if the id
// is invalid, the announcement doesn't exist, "title" / "content" is given but blank, or saving failed.
export async function update(
  id: number | string,
  partialData: PartialAnnouncementData,
): Promise<AnnouncementResult> {
  const numericId = parseId(id);
  if (numericId === null) return { error: invalidIdMessage(id) };

  const error = validateAnnouncement(partialData, false);
  if (error) return { error };

  return safely(async () => {
    const announcement = await AnnouncementModel.updateAnnouncement(numericId, partialData);
    return announcement ? { announcement } : { error: notFoundMessage(id) };
  });
}

// Deletes the announcement. Returns { id } on success,
// or { error } if the id is invalid, there is none, or deleting failed.
async function remove(id: number | string): Promise<DeleteResult> {
  const numericId = parseId(id);
  if (numericId === null) return { error: invalidIdMessage(id) };

  return safely(async () =>
    (await AnnouncementModel.deleteAnnouncement(numericId))
      ? { id: numericId }
      : { error: notFoundMessage(id) },
  );
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use AnnouncementController.delete(id).
export { remove as delete };
