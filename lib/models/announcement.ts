// Announcement Model (the "M" in MVC).
// Owns the announcement data and the only functions allowed to read or change it.
// Stored in PostgreSQL (table "announcements", created by migrations/002_create_announcements.up.sql)
// and accessed with plain, parameterized SQL through lib/db.ts — no ORM. No HTTP or Next.js code here.

import { query } from "@/lib/db";

// A stored announcement. "title" and "content" are required, "author" is optional free text.
// createdAt and updatedAt are ISO date strings (e.g. "2026-10-10T09:30:00.000Z"), set by the database.
export type Announcement = {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
};

// Data for creating or fully replacing an announcement: everything except the id and timestamps.
export type AnnouncementData = {
  title: string;
  content: string;
  author?: string;
};

// Data for a partial update: any subset of title, content and author.
export type PartialAnnouncementData = Partial<AnnouncementData>;

// A row of the announcements table, as pg returns it (bigint as a string, timestamptz as a Date)
type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  author: string | null;
  created_at: Date;
  updated_at: Date;
};

// The columns every query returns
const COLUMNS = "id, title, content, author, created_at, updated_at";

// Turns a database row into the camelCase Announcement the controllers and views use.
// An empty (NULL) author is left out, like an author that was never sent.
function toAnnouncement(row: AnnouncementRow): Announcement {
  const announcement: Announcement = {
    id: Number(row.id),
    title: row.title,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
  if (row.author !== null) announcement.author = row.author;
  return announcement;
}

// An id can only match a row if it's a whole number in range.
function isValidId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

// Adds a new announcement (the database assigns the id and sets createdAt / updatedAt to now)
// and returns it.
export async function createAnnouncement(data: AnnouncementData): Promise<Announcement> {
  const [row] = await query<AnnouncementRow>(
    `INSERT INTO announcements (title, content, author)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [data.title, data.content, data.author ?? null],
  );
  return toAnnouncement(row);
}

// Returns every announcement, newest first (an empty array if there are none).
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const rows = await query<AnnouncementRow>(
    `SELECT ${COLUMNS} FROM announcements ORDER BY created_at DESC, id DESC`,
  );
  return rows.map(toAnnouncement);
}

// Returns the announcement with this id, or undefined if there is none.
export async function getAnnouncementById(id: number): Promise<Announcement | undefined> {
  if (!isValidId(id)) return undefined;
  const [row] = await query<AnnouncementRow>(
    `SELECT ${COLUMNS} FROM announcements WHERE id = $1`,
    [id],
  );
  return row ? toAnnouncement(row) : undefined;
}

// Replaces the whole announcement with new data, keeping the same id and createdAt
// and refreshing updatedAt. A field not included in data (author) is removed.
// Returns the updated announcement, or undefined if not found.
export async function replaceAnnouncement(
  id: number,
  data: AnnouncementData,
): Promise<Announcement | undefined> {
  if (!isValidId(id)) return undefined;
  const [row] = await query<AnnouncementRow>(
    `UPDATE announcements
     SET title = $2, content = $3, author = $4, updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, data.title, data.content, data.author ?? null],
  );
  return row ? toAnnouncement(row) : undefined;
}

// Changes only the fields given, keeps every other field as it was, and refreshes updatedAt.
// Returns the updated announcement, or undefined if not found.
// Each column gets a "was it sent?" flag, so the SQL text never changes.
export async function updateAnnouncement(
  id: number,
  partialData: PartialAnnouncementData,
): Promise<Announcement | undefined> {
  if (!isValidId(id)) return undefined;
  const [row] = await query<AnnouncementRow>(
    `UPDATE announcements SET
       title      = CASE WHEN $2 THEN $3 ELSE title END,
       content    = CASE WHEN $4 THEN $5 ELSE content END,
       author     = CASE WHEN $6 THEN $7 ELSE author END,
       updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [
      id,
      partialData.title !== undefined, partialData.title ?? null,
      partialData.content !== undefined, partialData.content ?? null,
      partialData.author !== undefined, partialData.author ?? null,
    ],
  );
  return row ? toAnnouncement(row) : undefined;
}

// Removes the announcement. Returns true if it was deleted, false if no announcement had this id.
export async function deleteAnnouncement(id: number): Promise<boolean> {
  if (!isValidId(id)) return false;
  const rows = await query(`DELETE FROM announcements WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
