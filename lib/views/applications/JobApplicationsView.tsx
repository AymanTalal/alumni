import type { ApplicationStatus, ApplicationWithUser } from "@/lib/models/application";
import type { User } from "@/lib/models/user";
import { formatShortDate } from "../announcements/formatDate";
import Avatar from "../ui/Avatar";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Inset from "../ui/Inset";
import { UsersIcon } from "../ui/icons";
import Panel from "../ui/Panel";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
import ApplicationCreateForm, { type ApplicationFormState } from "./ApplicationCreateForm";
import ApplicationStatusForm from "./ApplicationStatusForm";
import DeleteApplicationButton, { type DeleteApplicationState } from "./DeleteApplicationButton";

// View: the "Applicants" panel of a job posting's page (DESIGN.md §9: a Panel with the table — a
// management list keeps the table — or the empty state). Markup and styling only, no data logic: the page gets the applications (already joined
// with their users) from ApplicationController and passes them in, with the users and the Server
// Actions.
//   - the applicants in the shared table: avatar + name (→ /users/{id}) with email and applied date under
//     it, a status badge, and the row actions (the status dropdown + Update, secondary; Remove,
//     danger, asks first) — never a primary button in a row
//   - then the "Add application" form in a light box inside the panel; its button is the page's
//     ONE primary button
//   - nobody applied yet: the empty state, with the same "Add application" box right under it —
//     that form is the empty state's one action (DESIGN.md §4). The card stays in the SAME place
//     in both cases on purpose: when the first application is added and the table appears, React
//     keeps the form (and its "Application added." message) instead of building a new one
//   - no graduates or students at all: a text link to add one first (no form, no primary button)

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
  const addForm =
    users.length === 0 ? (
      <p className="text-sm text-muted">
        There are no graduates or students yet. <TextLink href="/users/new">Add a graduate</TextLink> first,
        then come back to add their application.
      </p>
    ) : (
      <ApplicationCreateForm jobPostingId={jobPostingId} users={users} action={createAction} />
    );

  return (
    <Panel
      title="Applicants"
      icon={<UsersIcon />}
      count={applications.length === 1 ? "1 application" : `${applications.length} applications`}
    >
      {applications.length === 0 ? (
        <EmptyState title="No one has applied yet.">
          Choose a graduate or student below to add the first application.
        </EmptyState>
      ) : (
        <Table>
          <TableHead>
            <Th>Applicant</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <Tr key={application.id}>
                <Td className="min-w-52">
                  <div className="flex items-center gap-3">
                    <Avatar name={application.user.name} size="sm" />
                    <div className="min-w-0">
                      <TextLink href={`/users/${application.user.id}`}>{application.user.name}</TextLink>
                      <div className="text-muted">
                        {application.user.email ? `${application.user.email} · ` : ""}
                        Applied {formatShortDate(application.createdAt)}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={application.status} />
                </Td>
                {/* The status dropdown keeps a readable width (the narrow table would squeeze it) */}
                <Td align="right" className="[&_select]:min-w-28">
                  <div className="flex items-start justify-end gap-2">
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

      {/* Same place in both cases, so the form keeps its message when the table appears */}
      <Inset title="Add application" className="mt-5">
        {addForm}
      </Inset>
    </Panel>
  );
}
