import Link from "next/link";
import type { JobPosting } from "@/lib/models/jobPosting";
import { formatDate } from "../announcements/formatDate";
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
    <>
      <Link href="/jobs" className="text-blue-600 hover:underline">
        ← All job postings
      </Link>

      <h1 className="mt-6 text-3xl font-bold">{jobPosting.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {jobPosting.company ? `${jobPosting.company} · ` : ""}
        Posted {formatDate(jobPosting.createdAt)}
        {jobPosting.updatedAt !== jobPosting.createdAt &&
          ` · Updated ${formatDate(jobPosting.updatedAt)}`}
      </p>

      <div className="mt-8 flex items-start gap-4">
        <Link
          href={`/jobs/${jobPosting.id}/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Edit
        </Link>
        <div className="py-2">
          <DeleteJobPostingButton
            jobPostingId={jobPosting.id}
            title={jobPosting.title}
            action={deleteAction}
          />
        </div>
      </div>
    </>
  );
}
