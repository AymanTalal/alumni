import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementEditForm from "@/lib/views/announcements/AnnouncementEditForm";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { updateAnnouncementAction } from "../../actions";

// Route: "/announcements/:id/edit"  (file: app/announcements/[id]/edit/page.tsx)
// GET → Page → AnnouncementController.getById → Model, rendered by AnnouncementEditForm.
// Submitting the form runs updateAnnouncementAction (../../actions.ts) → AnnouncementController.update.

export default async function EditAnnouncementPage({
  params,
}: PageProps<"/announcements/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await AnnouncementController.getById(id);

  // Unknown or invalid id → 404 status and the "Announcement not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer width="narrow">
      <PageHeader
        back={{ href: `/announcements/${result.announcement.id}`, label: "Back to the announcement" }}
        title="Edit announcement"
      />
      <AnnouncementEditForm announcement={result.announcement} action={updateAnnouncementAction} />
    </PageContainer>
  );
}
