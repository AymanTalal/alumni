import type { JobPosting } from "@/lib/models/jobPosting";
import { formatDate } from "../announcements/formatDate";
import { ButtonLink } from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import DeleteJobPostingButton, { type DeleteJobPostingState } from "./DeleteJobPostingButton";

// View: shows one job posting, plus Edit and Delete buttons and a link back to the list.
// Markup and styling only, no data logic: the page gets the posting from JobPostingController
// and passes it in, together with the delete Server Action. The page renders the posting's
// Applications section below it (lib/views/applications/JobApplicationsView.tsx).

type Props = {
  jobPosting: JobPosting;
  deleteAction: (
    jobPostingId: number,
    state: DeleteJobPostingState,
    formData: FormData,
  ) => Promise<DeleteJobPostingState>;
};

export default function JobPostingDetailView({ jobPosting, deleteAction }: Props) {
  return (
    <PageHeader
      back={{ href: "/jobs", label: "All job postings" }}
      title={jobPosting.title}
      description={
        <>
          {jobPosting.company && (
            <span className="font-medium text-ink">{jobPosting.company} · </span>
          )}
          Posted {formatDate(jobPosting.createdAt)}
          {jobPosting.updatedAt !== jobPosting.createdAt &&
            ` · Updated ${formatDate(jobPosting.updatedAt)}`}
        </>
      }
      actions={
        <>
          <ButtonLink href={`/jobs/${jobPosting.id}/edit`}>Edit</ButtonLink>
          <DeleteJobPostingButton
            jobPostingId={jobPosting.id}
            title={jobPosting.title}
            action={deleteAction}
            size="md"
          />
        </>
      }
    />
  );
}
