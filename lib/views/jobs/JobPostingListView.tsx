import Link from "next/link";
import type { JobPosting } from "@/lib/models/jobPosting";
import { formatDate } from "../announcements/formatDate";
import DeleteJobPostingButton, { type DeleteJobPostingState } from "./DeleteJobPostingButton";

// View: renders a list of job postings as a table (title, company, date), with
// View / Edit / Delete for each row. Markup and styling only, no data logic: the page gets
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
      <p className="mt-6 text-gray-600">
        No job postings yet. Add one with the &quot;New job posting&quot; button, or with{" "}
        <code>POST /api/jobs</code>.
      </p>
    );
  }

  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="py-2 pr-4">Title</th>
          <th className="py-2 pr-4">Company</th>
          <th className="py-2 pr-4">Date</th>
          <th className="py-2 pr-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {jobPostings.map((jobPosting) => (
          <tr key={jobPosting.id} className="border-b border-gray-200 align-top">
            <td className="py-2 pr-4 font-medium">{jobPosting.title}</td>
            <td className="py-2 pr-4">{jobPosting.company || "—"}</td>
            <td className="py-2 pr-4 text-sm text-gray-600">{formatDate(jobPosting.createdAt)}</td>
            <td className="py-2 pr-4">
              <div className="flex gap-3">
                <Link href={`/jobs/${jobPosting.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
                <Link href={`/jobs/${jobPosting.id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <DeleteJobPostingButton
                  jobPostingId={jobPosting.id}
                  title={jobPosting.title}
                  action={deleteAction}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
