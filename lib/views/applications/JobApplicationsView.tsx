import type { ApplicationStatus, ApplicationWithUser } from "@/lib/models/application";
import type { User } from "@/lib/models/user";
import { formatDate } from "../announcements/formatDate";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Section from "../ui/Section";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
import ApplicationCreateForm, { type ApplicationFormState } from "./ApplicationCreateForm";
import ApplicationStatusForm from "./ApplicationStatusForm";
import DeleteApplicationButton, { type DeleteApplicationState } from "./DeleteApplicationButton";

// View: the "Applications" section of a job posting's page: a table of the applicants (name,
// email, status, date) with a status form and a Remove button for each, and the "Add application"
// form. Markup and styling only, no data logic: the page gets the applications (already joined with
// their users) from ApplicationController and passes them in, with the users and the Server Actions.

type Props = {
  jobPostingId: number;
  applications: ApplicationWithUser[];
  users: User[];
  statuses: readonly ApplicationStatus[];
  createAction: (
    jobPostingId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
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

export default function JobApplicationsView({
  jobPostingId,
  applications,
  users,
  statuses,
  createAction,
  updateStatusAction,
  deleteAction,
}: Props) {
  return (
    <Section title="Applications" description={`${applications.length} application(s)`}>
      {applications.length === 0 ? (
        <EmptyState title="No applications yet.">Add one with the form below.</EmptyState>
      ) : (
        <Table>
          <TableHead>
            <Th>Applicant</Th>
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
      )}

      <ApplicationCreateForm jobPostingId={jobPostingId} users={users} action={createAction} />
    </Section>
  );
}
