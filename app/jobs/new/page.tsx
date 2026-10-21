import JobPostingCreateForm from "@/lib/views/jobs/JobPostingCreateForm";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import { createJobPostingAction } from "../actions";

// Route: "/jobs/new"  (file: app/jobs/new/page.tsx)
// GET → Page, rendered by JobPostingCreateForm.
// Submitting the form runs createJobPostingAction (../actions.ts) → JobPostingController.create,
// which goes to the new posting's page on success.

export default function NewJobPostingPage() {
  return (
    <PageContainer width="narrow">
      <PageHeader back={{ href: "/jobs", label: "All job postings" }} title="New job posting" />
      <JobPostingCreateForm action={createJobPostingAction} />
    </PageContainer>
  );
}
