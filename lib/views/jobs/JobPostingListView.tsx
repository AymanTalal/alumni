import type { JobPosting } from "@/lib/models/jobPosting";
import EmptyState from "../ui/EmptyState";
import JobCard from "./JobCard";

// View: the job postings on /jobs as a grid of job cards (DESIGN.md §9, browsing pages) — the same
// cards as the homepage: company initial, title, company, posted date, applications count; the
// newest (the list is newest first) has the yellow top strip and a "New" chip. Each card links to
// the posting's page, where Edit, Delete and the applicants are. Markup only: the page gets the
// postings and each posting's application count and passes them in.
// An empty list shows the empty state (illustration) with its ONE button, "Post a job".

type Props = {
  jobPostings: JobPosting[];
  applicationCounts: Record<number, number>; // job posting id → number of applications
};

export default function JobPostingListView({ jobPostings, applicationCounts }: Props) {
  if (jobPostings.length === 0) {
    return (
      <EmptyState title="No job postings yet." action={{ href: "/jobs/new", label: "Post a job" }}>
        Be the first to post one.
      </EmptyState>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobPostings.map((jobPosting, index) => (
        <li key={jobPosting.id} className="min-w-0">
          <JobCard jobPosting={jobPosting} applicationCount={applicationCounts[jobPosting.id] ?? 0} newest={index === 0} />
        </li>
      ))}
    </ul>
  );
}
