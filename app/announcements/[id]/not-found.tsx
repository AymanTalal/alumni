import EmptyState from "@/lib/views/ui/EmptyState";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";

// Shown (with HTTP 404) when app/announcements/[id]/page.tsx calls notFound() for an unknown id.
export default function AnnouncementNotFound() {
  return (
    <PageContainer width="narrow">
      <PageHeader back={{ href: "/announcements", label: "All announcements" }} title="Announcement not found" />
      <EmptyState title="There is no announcement with this id.">Check the link, or go back to the list.</EmptyState>
    </PageContainer>
  );
}
