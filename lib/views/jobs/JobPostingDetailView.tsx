import type { JobPosting } from "@/lib/models/jobPosting";
import { formatShortDate } from "../announcements/formatDate";
import Avatar from "../ui/Avatar";
import { ButtonLink } from "../ui/Button";
import Chip from "../ui/Chip";
import DetailHeader from "../ui/DetailHeader";
import { CalendarIcon, UserIcon } from "../ui/icons";
import DeleteJobPostingButton, { type DeleteJobPostingState } from "./DeleteJobPostingButton";

// View: the posting header card on /jobs/{id} (DESIGN.md §9, detail pages) — it overlaps the page
// band: the company's initial, the title (<h1>), the company, and chips with the posted date (and
// the update date when it was changed on a later day) and the applications count; on the right Edit
// (secondary) and Delete (danger, asks first). The page's ONE primary button is "Add application"
// in the Applicants panel below. Markup only: the page passes the posting, its applications count
// and the delete Server Action.

type Props = {
  jobPosting: JobPosting;
  applicationCount: number;
  deleteAction: (
    jobPostingId: number,
    state: DeleteJobPostingState,
    formData: FormData,
  ) => Promise<DeleteJobPostingState>;
};

export default function JobPostingDetailView({ jobPosting, applicationCount, deleteAction }: Props) {
  const posted = formatShortDate(jobPosting.createdAt);
  const updated = formatShortDate(jobPosting.updatedAt);

  return (
    <DetailHeader
      media={<Avatar name={jobPosting.company || jobPosting.title} letters={1} shape="square" size="xl" />}
      title={jobPosting.title}
      subtitle={jobPosting.company ? <span className="font-medium text-ink">{jobPosting.company}</span> : "Company: Not given"}
      chips={
        <>
          <Chip icon={<CalendarIcon size={14} />}>Posted {posted}</Chip>
          {/* Shown when it was changed on a later day (a same-day edit shows the same date) */}
          {updated !== posted && <Chip icon={<CalendarIcon size={14} />}>Updated {updated}</Chip>}
          <Chip tone={applicationCount > 0 ? "primary" : "neutral"} icon={<UserIcon size={14} />}>
            {applicationCount === 1 ? "1 application" : `${applicationCount} applications`}
          </Chip>
        </>
      }
      actions={
        <>
          <ButtonLink href={`/jobs/${jobPosting.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteJobPostingButton jobPostingId={jobPosting.id} title={jobPosting.title} action={deleteAction} size="md" />
        </>
      }
    />
  );
}
