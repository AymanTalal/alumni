import Link from "next/link";
import { connection } from "next/server";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import JobPostingListView from "@/lib/views/jobs/JobPostingListView";
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Job postings</h1>
          <p className="mt-1 text-gray-600">{jobPostings.length} job posting(s)</p>
        </div>
        <Link href="/jobs/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          New job posting
        </Link>
      </div>

      <JobPostingListView jobPostings={jobPostings} deleteAction={deleteJobPostingAction} />
    </main>
  );
}
