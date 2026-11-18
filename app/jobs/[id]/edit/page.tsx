import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as JobPostingController from "@/lib/controllers/JobPostingController";
import DeleteJobPostingButton from "@/lib/views/jobs/DeleteJobPostingButton";
import JobPostingEditForm from "@/lib/views/jobs/JobPostingEditForm";
import { BriefcaseIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import { deleteJobPostingAction, updateJobPostingAction } from "../../actions";

// Route: "/jobs/:id/edit"  (file: app/jobs/[id]/edit/page.tsx)
// GET → Page → JobPostingController.getById → Model, rendered by JobPostingEditForm.
// Submitting the form runs updateJobPostingAction (../../actions.ts) → JobPostingController.update;
// the Delete button runs deleteJobPostingAction → JobPostingController.delete.
// The same form look as /jobs/new (DESIGN.md, Forms).

export const metadata: Metadata = { title: "Edit job posting" };

export default async function EditJobPostingPage({ params }: PageProps<"/jobs/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await JobPostingController.getById(id);

  // Unknown or invalid id → 404 status and the "Job posting not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: `/jobs/${result.jobPosting.id}`, label: "Back to the job posting" }}
          title="Edit job posting"
          description={result.jobPosting.title}
          actions={
            <DeleteJobPostingButton
              jobPostingId={result.jobPosting.id}
              title={result.jobPosting.title}
              action={deleteJobPostingAction}
              size="md"
            />
          }
        />
      }
    >
      <Panel title="Job posting details" icon={<BriefcaseIcon />} iconTone="accent">
        <JobPostingEditForm jobPosting={result.jobPosting} action={updateJobPostingAction} />
      </Panel>
    </PageContainer>
  );
}
