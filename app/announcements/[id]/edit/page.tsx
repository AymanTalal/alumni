import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementEditForm from "@/lib/views/announcements/AnnouncementEditForm";
import { MegaphoneIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import { updateAnnouncementAction } from "../../actions";

// Route: "/announcements/:id/edit"  (file: app/announcements/[id]/edit/page.tsx)
// GET → Page → AnnouncementController.getById → Model, rendered by AnnouncementEditForm (the same
// form look as /announcements/new). Submitting the form runs updateAnnouncementAction
// (../../actions.ts) → AnnouncementController.update, which shows the validation error in the form
// or goes back to /announcements/{id}.

export const metadata: Metadata = { title: "Edit announcement" };

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
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: `/announcements/${result.announcement.id}`, label: "Back to the announcement" }}
          title="Edit announcement"
          description={result.announcement.title}
        />
      }
    >
      <Panel title="Announcement" icon={<MegaphoneIcon />}>
        <AnnouncementEditForm announcement={result.announcement} action={updateAnnouncementAction} />
      </Panel>
    </PageContainer>
  );
}
