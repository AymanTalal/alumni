import type { ApplicationStatus, ApplicationWithDetails } from "@/lib/models/application";
import { formatShortDate } from "../announcements/formatDate";
import Avatar from "../ui/Avatar";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
import type { ApplicationFormState } from "./ApplicationCreateForm";
import ApplicationStatusForm from "./ApplicationStatusForm";
import DeleteApplicationButton, { type DeleteApplicationState } from "./DeleteApplicationButton";

// View: the table on /applications, inside the page's Panel (DESIGN.md §9: a management list keeps
// the table; the empty state). Markup and styling
// only, no data logic: the page gets the applications (already joined with their users and
// postings) from ApplicationController and passes them in, with the Server Actions.
//   - applicant: avatar + name (→ /users/{id}) with the email under it; job posting: title (→ /jobs/{id})
//     with the company under it; a status badge; the short applied date
//   - the last column, right-aligned: the same status dropdown + Update (secondary) and Remove
//     (danger, asks first) as on a job posting's page — never a primary button in a row
//   - an empty list shows the empty state with its ONE button, "Browse job postings" (applications
//     are added from a job posting's page)

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
      <EmptyState title="No applications yet." action={{ href: "/jobs", label: "Browse job postings" }}>
        Applications are added from a job posting&apos;s page.
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
                  <div className="whitespace-nowrap text-muted">{application.user.email || "Not given"}</div>
                </div>
              </div>
            </Td>
            <Td className="min-w-40">
              <TextLink href={`/jobs/${application.jobPosting.id}`}>{application.jobPosting.title}</TextLink>
              <div className="text-muted">{application.jobPosting.company || "Not given"}</div>
            </Td>
            <Td>
              <StatusBadge status={application.status} />
            </Td>
            <Td className="whitespace-nowrap text-muted">{formatShortDate(application.createdAt)}</Td>
            {/* The status dropdown keeps a readable width (the table would squeeze it) */}
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
  );
}
