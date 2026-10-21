import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import DeleteJobPostingButton from "@/lib/views/jobs/DeleteJobPostingButton";
import JobPostingEditForm from "@/lib/views/jobs/JobPostingEditForm";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { deleteJobPostingAction, updateJobPostingAction } from "../../actions";

// Route: "/jobs/:id/edit"  (file: app/jobs/[id]/edit/page.tsx)
// GET → Page → JobPostingController.getById → Model, rendered by JobPostingEditForm.
// Submitting the form runs updateJobPostingAction (../../actions.ts) → JobPostingController.update;
// the Delete button runs deleteJobPostingAction → JobPostingController.delete.

export default async function EditJobPostingPage({ params }: PageProps<"/jobs/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await JobPostingController.getById(id);

  // Unknown or invalid id → 404 status and the "Job posting not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer width="narrow">
      <PageHeader
        back={{ href: `/jobs/${result.jobPosting.id}`, label: "Back to the job posting" }}
        title="Edit job posting"
        actions={
          <DeleteJobPostingButton
            jobPostingId={result.jobPosting.id}
            title={result.jobPosting.title}
            action={deleteJobPostingAction}
            size="md"
          />
        }
      />
      <JobPostingEditForm jobPosting={result.jobPosting} action={updateJobPostingAction} />
    </PageContainer>
  );
}
