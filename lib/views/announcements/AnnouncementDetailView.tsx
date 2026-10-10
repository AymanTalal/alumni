import Link from "next/link";
import type { Announcement } from "@/lib/models/announcement";
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
      <Link href="/announcements" className="text-blue-600 hover:underline">
        ← All announcements
      </Link>

      <h1 className="mt-6 text-3xl font-bold">{announcement.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {announcement.author ? `By ${announcement.author} · ` : ""}
        Posted {formatDate(announcement.createdAt)}
        {announcement.updatedAt !== announcement.createdAt &&
          ` · Updated ${formatDate(announcement.updatedAt)}`}
      </p>

      <p className="mt-6 whitespace-pre-line text-gray-800">{announcement.content}</p>

      <div className="mt-8 flex items-start gap-4">
        <Link
          href={`/announcements/${announcement.id}/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Edit
        </Link>
        <div className="py-2">
          <DeleteAnnouncementButton
            announcementId={announcement.id}
            title={announcement.title}
            action={deleteAction}
          />
        </div>
      </div>
    </>
  );
}
