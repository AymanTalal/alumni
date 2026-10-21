import EmptyState from "@/lib/views/ui/EmptyState";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";

// Shown (with HTTP 404) when app/jobs/[id]/page.tsx calls notFound() for an unknown id.
export default function JobPostingNotFound() {
  return (
    <PageContainer width="narrow">
      <PageHeader back={{ href: "/jobs", label: "All job postings" }} title="Job posting not found" />
      <EmptyState title="There is no job posting with this id.">Check the link, or go back to the list.</EmptyState>
    </PageContainer>
  );
}
