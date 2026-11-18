import AnnouncementCreateForm from "@/lib/views/announcements/AnnouncementCreateForm";
import { MegaphoneIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import { createAnnouncementAction } from "../actions";

// Route: "/announcements/new"  (file: app/announcements/new/page.tsx)
// GET → Page, rendered by AnnouncementCreateForm (title, content, author).
// Submitting the form runs createAnnouncementAction (../actions.ts) → AnnouncementController.create,
// which shows the validation error in the form, or goes to the new announcement's page on success.

export const metadata = { title: "Post an announcement" };

export default function NewAnnouncementPage() {
  return (
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: "/announcements", label: "All announcements" }}
          title="Post an announcement"
          description="Share news or an event with our graduates."
        />
      }
    >
      <Panel title="Announcement" icon={<MegaphoneIcon />}>
        <AnnouncementCreateForm action={createAnnouncementAction} />
      </Panel>
    </PageContainer>
  );
}
