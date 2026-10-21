import type { ApplicationStatus, ApplicationWithDetails } from "@/lib/models/application";
import { formatDate } from "../announcements/formatDate";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
import type { ApplicationFormState } from "./ApplicationCreateForm";
import ApplicationStatusForm from "./ApplicationStatusForm";
import DeleteApplicationButton, { type DeleteApplicationState } from "./DeleteApplicationButton";

// View: the table on /applications: every application with its applicant (name, email) and its
// job posting (title, company), the status and the date, plus the same status form and Remove
// button as on a job posting's page. Markup and styling only, no data logic: the page gets the
// applications (already joined with their users and postings) from ApplicationController and
// passes them in, with the Server Actions.

type Props = {
  applications: ApplicationWithDetails[];
  statuses: readonly ApplicationStatus[];
  updateStatusAction: (
    applicationId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
  deleteAction: (
    applicationId: number,
    state: DeleteApplicationState,
    formData: FormData,
  ) => Promise<DeleteApplicationState>;
};

export default function ApplicationListView({
  applications,
  statuses,
  updateStatusAction,
  deleteAction,
}: Props) {
  if (applications.length === 0) {
    return (
      <EmptyState title="No applications yet.">
        Open a job posting and use its &quot;Add application&quot; form, or use{" "}
        <code>POST /api/jobs/{"{id}"}/applications</code>.
      </EmptyState>
    );
  }

  return (
    <Table>
      <TableHead>
        <Th>Applicant</Th>
        <Th>Job posting</Th>
        <Th>Status</Th>
        <Th>Applied</Th>
        <Th>Actions</Th>
      </TableHead>
      <TableBody>
        {applications.map((application) => (
          <Tr key={application.id}>
            <Td>
              <TextLink href={`/users/${application.user.id}`}>{application.user.name}</TextLink>
              <div className="text-muted">{application.user.email || "—"}</div>
            </Td>
            <Td>
              <TextLink href={`/jobs/${application.jobPosting.id}`}>{application.jobPosting.title}</TextLink>
              <div className="text-muted">{application.jobPosting.company || "—"}</div>
            </Td>
            <Td>
              <StatusBadge status={application.status} />
            </Td>
            <Td className="whitespace-nowrap text-muted">{formatDate(application.createdAt)}</Td>
            <Td>
              <div className="flex flex-wrap items-start gap-2">
                <ApplicationStatusForm
                  // key: a new status remounts the form, so its dropdown shows the saved status
                  key={application.status}
                  applicationId={application.id}
                  status={application.status}
                  statuses={statuses}
                  action={updateStatusAction}
                />
                <DeleteApplicationButton
                  applicationId={application.id}
                  applicantName={application.user.name}
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
