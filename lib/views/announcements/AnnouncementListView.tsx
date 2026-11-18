import type { Announcement } from "@/lib/models/announcement";
import EmptyState from "../ui/EmptyState";
import AnnouncementCard from "./AnnouncementCard";

// View: the announcements on /announcements as a grid of announcement cards (DESIGN.md §9,
// browsing pages) — the same cards as the homepage: a date block, the title, a two-line preview and
// the author. Each card links to the announcement's page, where Edit and Delete are. Markup only:
// the page gets the announcements from AnnouncementController and passes them in.
// An empty list shows the empty state (illustration) with its ONE button, "Post an announcement".

export default function AnnouncementListView({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return (
      <EmptyState title="No announcements yet." action={{ href: "/announcements/new", label: "Post an announcement" }}>
        Share the first news with our graduates.
      </EmptyState>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {announcements.map((announcement) => (
        <li key={announcement.id} className="min-w-0">
          <AnnouncementCard announcement={announcement} />
        </li>
      ))}
    </ul>
  );
}
