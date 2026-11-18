import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementDetailView from "@/lib/views/announcements/AnnouncementDetailView";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import { deleteAnnouncementAction } from "../actions";

// Route: "/announcements/:id"  (file: app/announcements/[id]/page.tsx)
// GET → Page → AnnouncementController.getById → Model, rendered by AnnouncementDetailView (narrow
// detail layout, DESIGN.md). The Delete button runs deleteAnnouncementAction (../actions.ts) →
// AnnouncementController.delete.

// The browser tab shows the announcement's title ("Alumni Newsletter: Autumn Edition · IU Alumni")
export async function generateMetadata({ params }: PageProps<"/announcements/[id]">): Promise<Metadata> {
  const result = await AnnouncementController.getById((await params).id);
  return "error" in result ? {} : { title: result.announcement.title };
}

export default async function AnnouncementPage({ params }: PageProps<"/announcements/[id]">) {
  // Render on every request, so the page always reflects the current data
  await connection();

  const { id } = await params;
  const result = await AnnouncementController.getById(id);

  // Unknown or invalid id → 404 status and the "Announcement not found" page in ./not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer
      width="narrow"
      overlap
      band={<PageBand width="narrow" overlap back={{ href: "/announcements", label: "All announcements" }} eyebrow="Announcement" />}
    >
      <AnnouncementDetailView
        announcement={result.announcement}
        deleteAction={deleteAnnouncementAction}
      />
    </PageContainer>
  );
}
