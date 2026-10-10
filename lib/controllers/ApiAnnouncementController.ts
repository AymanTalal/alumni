// Announcement Controller for the JSON API side (what future /api/announcements routes will use).
// Each function takes the Request (and the route params where needed), calls the Announcement
// Model, and returns a NextResponse.json() with the right status code.
// It never stores data itself; all data access goes through lib/models/announcement.ts.

import { NextResponse } from "next/server";
import * as AnnouncementModel from "@/lib/models/announcement";
import type { AnnouncementData } from "@/lib/models/announcement";
import {
  invalidIdMessage,
  notFoundMessage,
  parseId,
  validateAnnouncement,
} from "./AnnouncementController";

// The second argument Next.js passes to a route handler under app/api/announcements/[id]/
type IdParams = { params: Promise<{ id: string }> };

const NOT_FORM_DATA = "Request body must be form-data";

// JSON error response with the given status code
function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

// Reads the form-data body into a plain object with every text field sent.
// Uploaded files are skipped. The Model only keeps title, content and author, and sets
// id, createdAt and updatedAt itself, so any other fields sent are ignored.
// Returns null if the body isn't form-data (request.formData() throws for JSON or an empty body).
async function readFormFields(request: Request): Promise<Record<string, string> | null> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return null;
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }
  return fields;
}

// POST /api/announcements: creates an announcement from form-data. "title" and "content" are
// required, "author" is optional. 201 with the new announcement, or 400 if the body isn't
// form-data or "title" / "content" is missing or blank.
export async function create(request: Request) {
  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);

  const error = validateAnnouncement(fields, true);
  if (error) return jsonError(error, 400);

  const announcement = AnnouncementModel.createAnnouncement(fields as AnnouncementData);
  return NextResponse.json(announcement, { status: 201 });
}

// GET /api/announcements: returns every announcement, newest first
// (an empty array if there are none). 200.
export function getAll() {
  return NextResponse.json(AnnouncementModel.getAllAnnouncements());
}

// GET /api/announcements/{id}: returns the announcement (200),
// 400 if the id isn't a valid number, or 404 if there is none.
export async function getById(_request: Request, { params }: IdParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return jsonError(invalidIdMessage(id), 400);

  const announcement = AnnouncementModel.getAnnouncementById(numericId);
  if (!announcement) return jsonError(notFoundMessage(id), 404);

  return NextResponse.json(announcement);
}

// PUT /api/announcements/{id}: replaces the whole announcement with the form-data sent, keeping
// the id and createdAt. 200 with the updated announcement, 404 if it doesn't exist, 400 if the
// id isn't a valid number, the body isn't form-data, or "title" / "content" is missing or blank.
export async function replace(request: Request, { params }: IdParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return jsonError(invalidIdMessage(id), 400);
  if (!AnnouncementModel.getAnnouncementById(numericId)) {
    return jsonError(notFoundMessage(id), 404);
  }

  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);

  const error = validateAnnouncement(fields, true);
  if (error) return jsonError(error, 400);

  const announcement = AnnouncementModel.replaceAnnouncement(numericId, fields as AnnouncementData);
  if (!announcement) return jsonError(notFoundMessage(id), 404);
  return NextResponse.json(announcement);
}

// PATCH /api/announcements/{id}: changes only the fields sent and keeps the rest.
// 200 with the updated announcement, 404 if it doesn't exist, 400 if the id isn't a valid number,
// the body isn't form-data, or "title" / "content" is sent but blank.
export async function update(request: Request, { params }: IdParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return jsonError(invalidIdMessage(id), 400);
  if (!AnnouncementModel.getAnnouncementById(numericId)) {
    return jsonError(notFoundMessage(id), 404);
  }

  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);

  const error = validateAnnouncement(fields, false);
  if (error) return jsonError(error, 400);

  const announcement = AnnouncementModel.updateAnnouncement(numericId, fields);
  if (!announcement) return jsonError(notFoundMessage(id), 404);
  return NextResponse.json(announcement);
}

// DELETE /api/announcements/{id}: removes the announcement. 200 with { message, id },
// 400 if the id isn't a valid number, or 404 if there is none.
async function remove(_request: Request, { params }: IdParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return jsonError(invalidIdMessage(id), 400);
  if (!AnnouncementModel.deleteAnnouncement(numericId)) {
    return jsonError(notFoundMessage(id), 404);
  }

  return NextResponse.json({ message: "Announcement deleted", id: numericId });
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use ApiAnnouncementController.delete(request, context).
export { remove as delete };
