import type { JobPosting } from "@/lib/models/jobPosting";
import { formatShortDate } from "../announcements/formatDate";
import Avatar from "../ui/Avatar";
import Chip from "../ui/Chip";
import { CalendarIcon, UserIcon } from "../ui/icons";
import LinkCard from "../ui/LinkCard";

// View: one job posting as a card (DESIGN.md §9, job cards) — the whole card links to /jobs/{id}:
// the company's initial, the title, the company, a "Posted …" chip and an applications chip. The
// newest posting (`newest`) shows the yellow top strip and a small "New" chip. City / type badges
// come once those fields exist (migration 006). Markup only; used by the homepage and /jobs.

type Props = { jobPosting: JobPosting; applicationCount: number; newest?: boolean };

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export default function JobCard({ jobPosting, applicationCount, newest = false }: Props) {
  return (
    <LinkCard href={`/jobs/${jobPosting.id}`} highlight={newest} className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <Avatar name={jobPosting.company || jobPosting.title} letters={1} shape="square" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold break-words text-ink group-hover:text-primary">{jobPosting.title}</h3>
          <p className="truncate text-sm text-muted">{jobPosting.company || "Company: Not given"}</p>
        </div>
        {newest && <Chip tone="accent">New</Chip>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip icon={<CalendarIcon size={14} />}>Posted {formatShortDate(jobPosting.createdAt)}</Chip>
        <Chip tone={applicationCount > 0 ? "primary" : "neutral"} icon={<UserIcon size={14} />}>
          {plural(applicationCount, "application", "applications")}
        </Chip>
      </div>
    </LinkCard>
  );
}
