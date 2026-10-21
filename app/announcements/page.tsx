import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementCreateForm from "@/lib/views/announcements/AnnouncementCreateForm";
import AnnouncementListView from "@/lib/views/announcements/AnnouncementListView";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { createAnnouncementAction, deleteAnnouncementAction } from "./actions";

// Route: "/announcements"  (file: app/announcements/page.tsx)
// GET /announcements  → Page → AnnouncementController.getAll → Model, rendered by AnnouncementListView
// POST /announcements → Server Actions in ./actions.ts: the "Add an announcement" form →
//                       AnnouncementController.create, each row's Delete button → AnnouncementController.delete

export default async function AnnouncementsPage() {
  // Render on every request, so new announcements show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { announcements } = await AnnouncementController.getAll();

  return (
    <PageContainer>
      <PageHeader title="Announcements" description={`${announcements.length} announcement(s)`} />

      <AnnouncementCreateForm action={createAnnouncementAction} />
      <AnnouncementListView announcements={announcements} deleteAction={deleteAnnouncementAction} />
    </PageContainer>
  );
}
