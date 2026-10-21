import type { Announcement } from "@/lib/models/announcement";
import { ButtonLink } from "../ui/Button";
import Card from "../ui/Card";
import PageHeader from "../ui/PageHeader";
import DeleteAnnouncementButton, { type DeleteAnnouncementState } from "./DeleteAnnouncementButton";
import { formatDate } from "./formatDate";

// View: shows one full announcement, plus Edit and Delete buttons and a link back to the list.
// Markup and styling only, no data logic: the page gets the announcement from
// AnnouncementController and passes it in, together with the delete Server Action.

type Props = {
  announcement: Announcement;
  deleteAction: (
    announcementId: number,
    state: DeleteAnnouncementState,
    formData: FormData,
  ) => Promise<DeleteAnnouncementState>;
};

export default function AnnouncementDetailView({ announcement, deleteAction }: Props) {
  return (
    <>
      <PageHeader
        back={{ href: "/announcements", label: "All announcements" }}
        title={announcement.title}
        description={
          <>
            {announcement.author ? `By ${announcement.author} · ` : ""}
            Posted {formatDate(announcement.createdAt)}
            {announcement.updatedAt !== announcement.createdAt &&
              ` · Updated ${formatDate(announcement.updatedAt)}`}
          </>
        }
        actions={
          <>
            <ButtonLink href={`/announcements/${announcement.id}/edit`}>Edit</ButtonLink>
            <DeleteAnnouncementButton
              announcementId={announcement.id}
              title={announcement.title}
              action={deleteAction}
              size="md"
            />
          </>
        }
      />

      <Card>
        <p className="leading-relaxed whitespace-pre-line text-ink">{announcement.content}</p>
      </Card>
    </>
  );
}
