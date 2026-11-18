import type { Announcement } from "@/lib/models/announcement";
import DateBlock from "../ui/DateBlock";
import LinkCard from "../ui/LinkCard";

// View: one announcement as a card (DESIGN.md §9, announcement cards) — the whole card links to
// /announcements/{id}: a date block, the title, a two-line preview and the author. Markup only;
// used by the homepage and /announcements.

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <LinkCard href={`/announcements/${announcement.id}`} className="flex h-full gap-4">
      <DateBlock iso={announcement.createdAt} />
      <div className="min-w-0">
        <h3 className="font-semibold break-words text-ink group-hover:text-primary">{announcement.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{announcement.content}</p>
        {announcement.author && <p className="mt-2 text-xs text-muted">By {announcement.author}</p>}
      </div>
    </LinkCard>
  );
}
