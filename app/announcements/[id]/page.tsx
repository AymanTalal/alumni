import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementDetailView from "@/lib/views/announcements/AnnouncementDetailView";
import PageContainer from "@/lib/views/ui/PageContainer";
import { deleteAnnouncementAction } from "../actions";

// Route: "/announcements/:id"  (file: app/announcements/[id]/page.tsx)
// GET → Page → AnnouncementController.getById → Model, rendered by AnnouncementDetailView.
// The Delete button runs deleteAnnouncementAction (../actions.ts) → AnnouncementController.delete.

export default async function AnnouncementPage({ params }: PageProps<"/announcements/[id]">) {
  // Render on every request, so the page always reflects the current data
  await connection();

  const { id } = await params;
  const result = await AnnouncementController.getById(id);

  // Unknown or invalid id → 404 status and the "Announcement not found" page in ./not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer width="narrow">
      <AnnouncementDetailView
        announcement={result.announcement}
        deleteAction={deleteAnnouncementAction}
      />
    </PageContainer>
  );
}
