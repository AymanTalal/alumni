import JobPostingCreateForm from "@/lib/views/jobs/JobPostingCreateForm";
import { BriefcaseIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import { createJobPostingAction } from "../actions";

// Route: "/jobs/new"  (file: app/jobs/new/page.tsx)
// GET → Page, rendered by JobPostingCreateForm.
// Submitting the form runs createJobPostingAction (../actions.ts) → JobPostingController.create,
// which goes to the new posting's page on success. The list's "Post a job" button leads here.

export const metadata = { title: "Post a job" };

export default function NewJobPostingPage() {
  return (
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: "/jobs", label: "All job postings" }}
          title="Post a job"
          description="Share a job with IU graduates."
        />
      }
    >
      <Panel title="Job posting details" icon={<BriefcaseIcon />} iconTone="accent">
        <JobPostingCreateForm action={createJobPostingAction} />
      </Panel>
    </PageContainer>
  );
}
