import { connection } from "next/server";
import * as AnnouncementController from "@/lib/controllers/AnnouncementController";
import AnnouncementListView from "@/lib/views/announcements/AnnouncementListView";
import { ButtonLink } from "@/lib/views/ui/Button";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";

// Route: "/announcements"  (file: app/announcements/page.tsx)
// GET /announcements → Page → AnnouncementController.getAll → Model, rendered by AnnouncementListView
// (a grid of announcement cards, DESIGN.md §9). New announcements are posted on /announcements/new;
// Edit and Delete are on each announcement's page. One primary button per view: "Post an
// announcement" in the band — or, when the list is empty, the empty state's button and nothing in
// the band.

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  // Render on every request, so new announcements show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { announcements } = await AnnouncementController.getAll();

  return (
    <PageContainer
      band={
        <PageBand
          eyebrow="News"
          title="Announcements"
          description="News and events from the university."
          count={announcements.length === 1 ? "1 announcement" : `${announcements.length} announcements`}
          actions={
            announcements.length > 0 ? (
              <ButtonLink href="/announcements/new" variant="onAction">
                Post an announcement
              </ButtonLink>
            ) : undefined
          }
        />
      }
    >
      <AnnouncementListView announcements={announcements} />
    </PageContainer>
  );
}
