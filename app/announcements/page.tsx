import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementCreateForm from "@/lib/views/announcements/AnnouncementCreateForm";
import AnnouncementListView from "@/lib/views/announcements/AnnouncementListView";
import { createAnnouncementAction, deleteAnnouncementAction } from "./actions";

// Route: "/announcements"  (file: app/announcements/page.tsx)
// GET /announcements  → Page → AnnouncementController.getAll → Model, rendered by AnnouncementListView
// POST /announcements → Server Actions in ./actions.ts: the "Add an announcement" form →
//                       AnnouncementController.create, each row's Delete button → AnnouncementController.delete

export default async function AnnouncementsPage() {
  // Render on every request, so new announcements show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { announcements } = AnnouncementController.getAll();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Announcements</h1>
      <p className="mt-1 text-gray-600">{announcements.length} announcement(s)</p>

      <AnnouncementCreateForm action={createAnnouncementAction} />
      <AnnouncementListView announcements={announcements} deleteAction={deleteAnnouncementAction} />
    </main>
  );
}
