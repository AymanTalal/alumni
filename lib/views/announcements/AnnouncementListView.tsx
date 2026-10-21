import type { Announcement } from "@/lib/models/announcement";
import { ButtonLink } from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
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
      <EmptyState title="No announcements yet.">
        Add one with the form above, or with <code>POST /api/announcements</code>.
      </EmptyState>
    );
  }

  return (
    <Table>
      <TableHead>
        <Th>Title</Th>
        <Th>Author</Th>
        <Th>Date</Th>
        <Th>Actions</Th>
      </TableHead>
      <TableBody>
        {announcements.map((announcement) => (
          <Tr key={announcement.id}>
            <Td>
              <TextLink href={`/announcements/${announcement.id}`}>{announcement.title}</TextLink>
            </Td>
            <Td>{announcement.author || "—"}</Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(announcement.createdAt)}</Td>
            <Td>
              <div className="flex flex-wrap items-start gap-2">
                <ButtonLink href={`/announcements/${announcement.id}`} variant="secondary" size="sm">
                  View
                </ButtonLink>
                <ButtonLink href={`/announcements/${announcement.id}/edit`} variant="secondary" size="sm">
                  Edit
                </ButtonLink>
                <DeleteAnnouncementButton
                  announcementId={announcement.id}
                  title={announcement.title}
                  action={deleteAction}
                />
              </div>
            </Td>
          </Tr>
        ))}
      </TableBody>
    </Table>
  );
}
