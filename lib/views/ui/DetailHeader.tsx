import { cardClasses } from "./Card";

// Shared UI: the header card of a detail page (DESIGN.md §9) — a profile, a job posting, an
// announcement. It overlaps the page band (PageContainer `overlap`): on the left the media (a
// large Avatar or a DateBlock), the title (<h1>), a subtitle and chips with the real facts; on the
// right the actions (Edit secondary, Delete danger — no primary here). Optional children come
// below (e.g. the announcement's full text). Markup and styling only.

type Props = {
  media: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  chips?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function DetailHeader({ media, title, subtitle, chips, actions, children }: Props) {
  return (
    <section className={`${cardClasses} p-5 shadow-card-hover sm:p-6`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {media}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight break-words text-ink sm:text-3xl">{title}</h1>
            {subtitle && <div className="mt-1 text-muted">{subtitle}</div>}
            {chips && <div className="mt-3 flex flex-wrap gap-2">{chips}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-start gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
