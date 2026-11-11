import SectionNotFound from "@/lib/views/ui/SectionNotFound";

// Shown (with HTTP 404) when app/jobs/[id]/page.tsx calls notFound() for an unknown id.
// Same look as every 404 page (lib/views/ui/NotFoundView.tsx); an invalid id like "abc" is shown as
// "Invalid id" instead of the text below.
export default function JobPostingNotFound() {
  return (
    <SectionNotFound
      title="Job posting not found"
      reason="There is no job posting with this id."
      resource="job posting"
      back={{ href: "/jobs", label: "All job postings" }}
    />
  );
}
