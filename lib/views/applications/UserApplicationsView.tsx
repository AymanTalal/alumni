import type { ApplicationWithJobPosting } from "@/lib/models/application";
import { formatDate } from "../announcements/formatDate";
import { StatusBadge } from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Section from "../ui/Section";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";

// View: the read-only "Applications" section of a user's page: the job postings this user applied
// to (title, company, status, date), each linking to /jobs/{id}. Markup and styling only, no data
// logic: the page gets the applications (already joined with their job postings) from
// ApplicationController and passes them in. Applications are changed on the job posting's page.

type Props = {
  applications: ApplicationWithJobPosting[];
};

export default function UserApplicationsView({ applications }: Props) {
  return (
    <Section title="Applications">
      {applications.length === 0 ? (
        <EmptyState title="This user hasn't applied to any job postings yet.">
          Applications are added on a job posting&apos;s page.
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
                <Td>
                  <TextLink href={`/jobs/${application.jobPosting.id}`}>
                    {application.jobPosting.title}
                  </TextLink>
                </Td>
                <Td>{application.jobPosting.company || "—"}</Td>
                <Td>
                  <StatusBadge status={application.status} />
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatDate(application.createdAt)}</Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  );
}
