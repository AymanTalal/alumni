import Link from "next/link";
import type { JobPosting } from "@/lib/models/jobPosting";
import { formatDate } from "../announcements/formatDate";
import { ButtonLink } from "../ui/Button";
import { cardClasses } from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import DeleteJobPostingButton, { type DeleteJobPostingState } from "./DeleteJobPostingButton";

// View: renders the job postings as job-listing cards (title, company, date), with
// View / Edit / Delete for each. Markup and styling only, no data logic: the page gets
// the postings from JobPostingController and passes them in, with the delete Server Action.

type Props = {
  jobPostings: JobPosting[];
  deleteAction: (
    jobPostingId: number,
    state: DeleteJobPostingState,
    formData: FormData,
  ) => Promise<DeleteJobPostingState>;
};

export default function JobPostingListView({ jobPostings, deleteAction }: Props) {
  if (jobPostings.length === 0) {
    return (
      <EmptyState title="No job postings yet.">
        Add one with the &quot;New job posting&quot; button, or with <code>POST /api/jobs</code>.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {jobPostings.map((jobPosting) => (
        <li
          key={jobPosting.id}
          className={`${cardClasses} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="min-w-0">
            <h2 className="text-lg font-semibold break-words text-ink">
              <Link href={`/jobs/${jobPosting.id}`} className="hover:text-primary hover:underline">
                {jobPosting.title}
              </Link>
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              <span className="font-medium text-ink">{jobPosting.company || "—"}</span>
              {" · "}Posted {formatDate(jobPosting.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-start gap-2">
            <ButtonLink href={`/jobs/${jobPosting.id}`} size="sm">
              View
            </ButtonLink>
            <ButtonLink href={`/jobs/${jobPosting.id}/edit`} variant="secondary" size="sm">
              Edit
            </ButtonLink>
            <DeleteJobPostingButton
              jobPostingId={jobPosting.id}
              title={jobPosting.title}
              action={deleteAction}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
