import Link from "next/link";
import JobPostingCreateForm from "@/lib/views/jobs/JobPostingCreateForm";
import { createJobPostingAction } from "../actions";

// Route: "/jobs/new"  (file: app/jobs/new/page.tsx)
// GET → Page, rendered by JobPostingCreateForm.
// Submitting the form runs createJobPostingAction (../actions.ts) → JobPostingController.create,
// which goes to the new posting's page on success.

export default function NewJobPostingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/jobs" className="text-blue-600 hover:underline">
        ← All job postings
      </Link>
      <h1 className="mt-6 text-3xl font-bold">New job posting</h1>
      <JobPostingCreateForm action={createJobPostingAction} />
    </main>
  );
}
