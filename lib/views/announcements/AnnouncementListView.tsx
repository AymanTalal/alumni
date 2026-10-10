import Link from "next/link";
import type { Announcement } from "@/lib/models/announcement";
import DeleteAnnouncementButton, { type DeleteAnnouncementState } from "./DeleteAnnouncementButton";
import { formatDate } from "./formatDate";

// View: renders a list of announcements as a table (title, author, date), with
// View / Edit / Delete for each row. Markup and styling only, no data logic: the page gets
// the announcements from AnnouncementController and passes them in, with the delete Server Action.

type Props = {
  announcements: Announcement[];
  deleteAction: (
    announcementId: number,
    state: DeleteAnnouncementState,
    formData: FormData,
  ) => Promise<DeleteAnnouncementState>;
};

export default function AnnouncementListView({ announcements, deleteAction }: Props) {
  if (announcements.length === 0) {
    return (
      <p className="mt-6 text-gray-600">
        No announcements yet. Add one with the form above, or with{" "}
        <code>POST /api/announcements</code>.
      </p>
    );
  }

  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="py-2 pr-4">Title</th>
          <th className="py-2 pr-4">Author</th>
          <th className="py-2 pr-4">Date</th>
          <th className="py-2 pr-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {announcements.map((announcement) => (
          <tr key={announcement.id} className="border-b border-gray-200 align-top">
            <td className="py-2 pr-4 font-medium">{announcement.title}</td>
            <td className="py-2 pr-4">{announcement.author || "—"}</td>
            <td className="py-2 pr-4 text-sm text-gray-600">{formatDate(announcement.createdAt)}</td>
            <td className="py-2 pr-4">
              <div className="flex gap-3">
                <Link
                  href={`/announcements/${announcement.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
                <Link
                  href={`/announcements/${announcement.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <DeleteAnnouncementButton
                  announcementId={announcement.id}
                  title={announcement.title}
                  action={deleteAction}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
