import SectionNotFound from "@/lib/views/ui/SectionNotFound";

// Shown (with HTTP 404) when app/announcements/[id]/page.tsx calls notFound() for an unknown id.
// Same look as every 404 page (lib/views/ui/NotFoundView.tsx); an invalid id like "abc" is shown as
// "Invalid id" instead of the text below.
export default function AnnouncementNotFound() {
  return (
    <SectionNotFound
      title="Announcement not found"
      reason="There is no announcement with this id."
      resource="announcement"
      back={{ href: "/announcements", label: "All announcements" }}
    />
  );
}
