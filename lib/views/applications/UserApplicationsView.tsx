import type { ApplicationWithJobPosting } from "@/lib/models/application";
import { formatShortDate } from "../announcements/formatDate";
import Avatar from "../ui/Avatar";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { ClipboardIcon } from "../ui/icons";
import Panel from "../ui/Panel";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";

// View: the read-only "Applications" panel of a user's page (DESIGN.md §9: a Panel with the table,
// or the empty state): the job postings this user applied to — company initial + title (→
// /jobs/{id}), company, status badge, short date. Markup only: the page gets the applications
// (already joined with their job postings) from ApplicationController and passes them in.
// Applications are added and changed on the job posting's page.
// With no applications, the empty state's ONE button ("Browse job postings") is the page's only
// primary button (Edit and Delete in the header card are secondary and danger).

type Props = {
  userName: string;
  applications: ApplicationWithJobPosting[];
};

export default function UserApplicationsView({ userName, applications }: Props) {
  return (
    <Panel
      title="Applications"
      icon={<ClipboardIcon />}
      count={applications.length === 1 ? "1 application" : `${applications.length} applications`}
      description={`The job postings ${userName} applied to.`}
    >
      {applications.length === 0 ? (
        <EmptyState title="No applications yet." action={{ href: "/jobs", label: "Browse job postings" }}>
          Applications are added from a job posting&apos;s page.
        </EmptyState>
      ) : (
        <Table>
          <TableHead>
            <Th>Job posting</Th>
            <Th>Company</Th>
            <Th>Status</Th>
            <Th>Applied</Th>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <Tr key={application.id}>
                <Td className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-3">
                    <Avatar name={application.jobPosting.company || application.jobPosting.title} letters={1} shape="square" size="sm" />
                    <TextLink href={`/jobs/${application.jobPosting.id}`}>{application.jobPosting.title}</TextLink>
                  </span>
                </Td>
                <Td className={application.jobPosting.company ? "whitespace-nowrap" : "text-muted"}>
                  {application.jobPosting.company || "Not given"}
                </Td>
                <Td>
                  <StatusBadge status={application.status} />
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatShortDate(application.createdAt)}</Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
