import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import * as UserController from "@/lib/controllers/UserController";
import JobApplicationsView from "@/lib/views/applications/JobApplicationsView";
import JobPostingDetailView from "@/lib/views/jobs/JobPostingDetailView";
import {
  createApplicationAction,
  deleteApplicationAction,
  deleteJobPostingAction,
  updateApplicationStatusAction,
} from "../actions";

// Route: "/jobs/:id"  (file: app/jobs/[id]/page.tsx)
// GET → Page → JobPostingController.getById → Model, rendered by JobPostingDetailView, and the
//       Applications section: ApplicationController.getAllForJob (applications with their users) and
//       UserController.getAll (the "Add application" dropdown), rendered by JobApplicationsView.
// The buttons run Server Actions in ../actions.ts: Delete → JobPostingController.delete;
// Add application → ApplicationController.createForJob; Update → ApplicationController.updateStatus;
// Remove → ApplicationController.delete.

export default async function JobPostingPage({ params }: PageProps<"/jobs/[id]">) {
  // Render on every request, so the page always reflects the current data
  await connection();

  const { id } = await params;
  const result = await JobPostingController.getById(id);

  // Unknown or invalid id → 404 status and the "Job posting not found" page in ./not-found.tsx
  if ("error" in result) notFound();

  const applications = await ApplicationController.getAllForJob(result.jobPosting.id);
  // The posting was deleted between the two reads → same 404 page
  if ("error" in applications) notFound();
  const { users } = await UserController.getAll();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <JobPostingDetailView jobPosting={result.jobPosting} deleteAction={deleteJobPostingAction} />
      <JobApplicationsView
        jobPostingId={result.jobPosting.id}
        applications={applications.applications}
        users={users}
        statuses={ApplicationController.STATUSES}
        createAction={createApplicationAction}
        updateStatusAction={updateApplicationStatusAction}
        deleteAction={deleteApplicationAction}
      />
    </main>
  );
}
