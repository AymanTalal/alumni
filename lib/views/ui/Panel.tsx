import { cardClasses } from "./Card";
import Chip from "./Chip";
import IconCircle, { type IconTone } from "./IconCircle";
import { ArrowRightIcon } from "./icons";
import TextLink from "./TextLink";

// Shared UI: a section as a large white panel (DESIGN.md §9) — rounded, hairline border, the soft
// card shadow — with a header row inside: a small icon in a soft circle, the title (<h2>), the
// count as a quiet chip, and "See all →" aligned right in the same row (it wraps below on a narrow
// phone). The panel's content (cards, an empty state) comes below. Markup and styling only.

type Props = {
  title: string;
  icon: React.ReactNode;
  iconTone?: IconTone;
  count?: string; // e.g. "10 job postings" — a real count, shown as a quiet chip
  description?: string; // one plain sentence under the header row
  seeAll?: { href: string; label: string }; // e.g. { href: "/jobs", label: "See all job postings" }
  compact?: boolean; // a narrower panel (e.g. half width): a slightly smaller title, so the row fits
  children: React.ReactNode;
};

export default function Panel({ title, icon, iconTone = "primary", count, description, seeAll, compact = false, children }: Props) {
  return (
    <section className={`${cardClasses} p-5 sm:p-6`}>
      <div className={`flex flex-wrap items-center gap-y-2 ${compact ? "gap-x-2" : "gap-x-3"}`}>
        <IconCircle tone={iconTone}>{icon}</IconCircle>
        <h2 className={`font-semibold tracking-tight text-ink ${compact ? "text-lg" : "text-xl"}`}>{title}</h2>
        {count && <Chip>{count}</Chip>}
        {seeAll && (
          <TextLink href={seeAll.href} className="ml-auto inline-flex items-center gap-1 text-sm">
            {seeAll.label} <ArrowRightIcon size={16} />
          </TextLink>
        )}
      </div>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
