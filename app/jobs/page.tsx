import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import JobPostingListView from "@/lib/views/jobs/JobPostingListView";
import { ButtonLink } from "@/lib/views/ui/Button";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";

// Route: "/jobs"  (file: app/jobs/page.tsx)
// GET /jobs  → Page → JobPostingController.getAll (the postings) and ApplicationController.getAll
//              (to count each posting's applications) → rendered by JobPostingListView (a grid of
//              job cards, DESIGN.md §9)
// New postings are created on /jobs/new; Edit and Delete are on each posting's page. One primary
// button per view: "Post a job" in the band — or, when the list is empty, the empty state's button
// and nothing in the band.

export const metadata = { title: "Job postings" };

export default async function JobsPage() {
  // Render on every request, so new job postings show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const [{ jobPostings }, { applications }] = await Promise.all([
    JobPostingController.getAll(),
    ApplicationController.getAll(),
  ]);

  // How many applications each posting has (postings with none are left out → 0 in the view)
  const applicationCounts: Record<number, number> = {};
  for (const application of applications) {
    applicationCounts[application.jobPostingId] = (applicationCounts[application.jobPostingId] ?? 0) + 1;
  }

  return (
    <PageContainer
      band={
        <PageBand
          eyebrow="Careers"
          title="Job postings"
          description="Jobs shared with IU graduates."
          count={jobPostings.length === 1 ? "1 job posting" : `${jobPostings.length} job postings`}
          actions={
            jobPostings.length > 0 ? (
              <ButtonLink href="/jobs/new" variant="onAction">
                Post a job
              </ButtonLink>
            ) : undefined
          }
        />
      }
    >
      <JobPostingListView jobPostings={jobPostings} applicationCounts={applicationCounts} />
    </PageContainer>
  );
}
