import type { Announcement } from "@/lib/models/announcement";
import { ButtonLink } from "../ui/Button";
import Chip from "../ui/Chip";
import DateBlock from "../ui/DateBlock";
import DetailHeader from "../ui/DetailHeader";
import { CalendarIcon, UserIcon } from "../ui/icons";
import DeleteAnnouncementButton, { type DeleteAnnouncementState } from "./DeleteAnnouncementButton";
import { formatShortDate } from "./formatDate";

// View: one announcement (DESIGN.md §9, detail pages) — a header card over the page band: a large
// date block, the title (<h1>), chips with the author and the dates (the update date when it was
// changed on a later day), Edit (secondary) and Delete (danger, asks first) — no primary button;
// then the full text in the same card, with its line breaks kept. Markup only: the page passes the
// announcement and the delete Server Action.

type Props = {
  announcement: Announcement;
  deleteAction: (
    announcementId: number,
    state: DeleteAnnouncementState,
    formData: FormData,
  ) => Promise<DeleteAnnouncementState>;
};

export default function AnnouncementDetailView({ announcement, deleteAction }: Props) {
  const posted = formatShortDate(announcement.createdAt);
  const updated = formatShortDate(announcement.updatedAt);

  return (
    <DetailHeader
      media={<DateBlock iso={announcement.createdAt} size="lg" />}
      title={announcement.title}
      chips={
        <>
          {announcement.author && <Chip icon={<UserIcon size={14} />}>By {announcement.author}</Chip>}
          <Chip icon={<CalendarIcon size={14} />}>Posted {posted}</Chip>
          {/* Shown when it was changed on a later day (a same-day edit shows the same date) */}
          {updated !== posted && <Chip icon={<CalendarIcon size={14} />}>Updated {updated}</Chip>}
        </>
      }
      actions={
        <>
          <ButtonLink href={`/announcements/${announcement.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteAnnouncementButton announcementId={announcement.id} title={announcement.title} action={deleteAction} size="md" />
        </>
      }
    >
      <div className="mt-6 border-t border-border pt-6">
        <p className="leading-relaxed break-words whitespace-pre-line text-ink">{announcement.content}</p>
      </div>
    </DetailHeader>
  );
}
