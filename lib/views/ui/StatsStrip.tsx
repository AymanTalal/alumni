import IconCircle from "./IconCircle";
import { pageWidthClasses } from "./PageContainer";

// Shared UI: the stats strip (DESIGN.md §9) — ONE white card that overlaps the bottom edge of the
// green hero band (half on the green, half on the page): the real counts in a row, each with a small
// icon, a big tabular number and a small label, with thin dividers between them on a wide screen
// (on a phone they wrap into two columns, without dividers). Put it right after a Hero with
// `overlap`. Real counts only. Markup and styling only.
// `bare`: just the card, for a page whose PageContainer already overlaps the band (e.g. the three
// status counts on /applications); `columns` sets how many sit in a row on a wide screen.

type Item = { label: string; value: number | string; icon: React.ReactNode };

const WIDE: Record<3 | 4 | 5, string> = { 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5" };
const DIVIDERS: Record<3 | 4 | 5, string> = { 3: "sm:divide-x sm:divide-border", 4: "lg:divide-x lg:divide-border", 5: "lg:divide-x lg:divide-border" };

export default function StatsStrip({ items, bare = false, columns = 5 }: { items: Item[]; bare?: boolean; columns?: 3 | 4 | 5 }) {
  const strip = (
    <dl className={`grid grid-cols-2 gap-y-5 rounded-card border border-border bg-surface px-2 py-5 shadow-card-hover ${WIDE[columns]} ${DIVIDERS[columns]}`}>
      {items.map(({ label, value, icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-3 px-4">
          <IconCircle>{icon}</IconCircle>
          <div className="flex min-w-0 flex-col-reverse">
            <dt className="text-sm break-words text-muted">{label}</dt>
            <dd className="text-2xl leading-tight font-semibold tracking-tight text-ink tabular-nums">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
  if (bare) return strip;
  return (
    <div className={`${pageWidthClasses()} relative z-10 -mt-12`}>{strip}</div>
  );
}
