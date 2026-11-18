import SectionNotFound from "@/lib/views/ui/SectionNotFound";

// Shown (with HTTP 404) when app/jobs/[id]/page.tsx calls notFound() for an unknown id.
// Same look as every 404 page (lib/views/ui/NotFoundView.tsx); an invalid id like "abc" is shown as
// its own "isn't a … number" text instead of the text below.
export default function JobPostingNotFound() {
  return (
    <SectionNotFound
      title="We couldn't find that job posting."
      reason="It may have been deleted, or the link may be wrong."
      resource="job posting"
      back={{ href: "/jobs", label: "All job postings" }}
    />
  );
}
