import { connection } from "next/server";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import JobPostingListView from "@/lib/views/jobs/JobPostingListView";
import { ButtonLink } from "@/lib/views/ui/Button";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { deleteJobPostingAction } from "./actions";

// Route: "/jobs"  (file: app/jobs/page.tsx)
// GET /jobs  → Page → JobPostingController.getAll → Model, rendered by JobPostingListView
// POST /jobs → Server Action in ./actions.ts: each row's Delete button → JobPostingController.delete
// New postings are created on /jobs/new.

export default async function JobsPage() {
  // Render on every request, so new job postings show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { jobPostings } = await JobPostingController.getAll();

  return (
    <PageContainer>
      <PageHeader
        title="Job postings"
        description={`${jobPostings.length} job posting(s)`}
        actions={<ButtonLink href="/jobs/new">New job posting</ButtonLink>}
      />

      <JobPostingListView jobPostings={jobPostings} deleteAction={deleteJobPostingAction} />
    </PageContainer>
  );
}
