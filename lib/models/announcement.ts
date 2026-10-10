// Announcement Model (the "M" in MVC).
// Owns the announcement data and the only functions allowed to read or change it.
// No HTTP or Next.js code here: this file only deals with data, so the in-memory array
// can later be swapped for a real database without changing the controllers.
// No database yet: data is lost when the server restarts.

// A stored announcement. "title" and "content" are required, "author" is optional.
// createdAt and updatedAt are ISO date strings (e.g. "2026-10-10T09:30:00.000Z") set by the Model.
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

// The store: the announcements array and the next id (which only ever goes up, so deleted ids
// are never reused). Next.js loads this file separately for API routes and for pages, so a plain
// module-level array would give each side its own copy. Keeping the store on globalThis makes
// every part of the server share the same one. Other code must still go through the functions below.
type AnnouncementStore = { announcements: Announcement[]; nextId: number };
const globalForAnnouncements = globalThis as typeof globalThis & {
  announcementStore?: AnnouncementStore;
};
const store: AnnouncementStore = (globalForAnnouncements.announcementStore ??= {
  announcements: [],
  nextId: 1,
});
const announcements = store.announcements;

// Copies only title, content and author, dropping undefined values (so they can't blank out
// existing fields). id, createdAt and updatedAt are never copied: only the Model sets them.
function cleanFields(data: PartialAnnouncementData): PartialAnnouncementData {
  const fields: PartialAnnouncementData = {};
  if (data.title !== undefined) fields.title = data.title;
  if (data.content !== undefined) fields.content = data.content;
  if (data.author !== undefined) fields.author = data.author;
  return fields;
}

// Returns the current time as an ISO date string.
function now(): string {
  return new Date().toISOString();
}

// Returns the array index of the announcement with this id, or -1 if there is none.
function indexOf(id: number): number {
  return announcements.findIndex((announcement) => announcement.id === id);
}

// Adds a new announcement with the next id, sets createdAt and updatedAt to now, and returns it.
export function createAnnouncement(data: AnnouncementData): Announcement {
  const timestamp = now();
  const announcement: Announcement = {
    id: store.nextId++,
    ...cleanFields(data),
    title: data.title,
    content: data.content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  announcements.push(announcement);
  return { ...announcement };
}

// Returns every announcement, newest first (an empty array if there are none).
// Ids only ever go up, so sorting by id descending is the same as newest createdAt first,
// even for two announcements created in the same millisecond.
export function getAllAnnouncements(): Announcement[] {
  return announcements
    .map((announcement) => ({ ...announcement }))
    .sort((a, b) => b.id - a.id);
}

// Returns the announcement with this id, or undefined if there is none.
export function getAnnouncementById(id: number): Announcement | undefined {
  const announcement = announcements[indexOf(id)];
  return announcement ? { ...announcement } : undefined;
}

// Replaces the whole announcement with new data, keeping the same id and createdAt
// and refreshing updatedAt. A field not included in data (author) is removed.
// Returns the updated announcement, or undefined if not found.
export function replaceAnnouncement(
  id: number,
  data: AnnouncementData,
): Announcement | undefined {
  const index = indexOf(id);
  if (index === -1) return undefined;

  const announcement: Announcement = {
    id,
    ...cleanFields(data),
    title: data.title,
    content: data.content,
    createdAt: announcements[index].createdAt,
    updatedAt: now(),
  };
  announcements[index] = announcement;
  return { ...announcement };
}

// Changes only the fields given, keeps every other field as it was, and refreshes updatedAt.
// Returns the updated announcement, or undefined if not found.
export function updateAnnouncement(
  id: number,
  partialData: PartialAnnouncementData,
): Announcement | undefined {
  const index = indexOf(id);
  if (index === -1) return undefined;

  const announcement: Announcement = {
    ...announcements[index],
    ...cleanFields(partialData),
    id,
    updatedAt: now(),
  };
  announcements[index] = announcement;
  return { ...announcement };
}

// Removes the announcement. Returns true if it was deleted, false if no announcement had this id.
export function deleteAnnouncement(id: number): boolean {
  const index = indexOf(id);
  if (index === -1) return false;

  announcements.splice(index, 1);
  return true;
}
