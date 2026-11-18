// Shared UI: a simple horizontal bar chart (DESIGN.md §9) made with plain HTML/CSS, no chart
// library — for counts like "users per department". Each row: the label, a bar in the action green
// whose width is relative to the largest value, and the count at the end of the bar (tabular). The
// width is set as a percentage (a size, not a color); the colors are tokens. No animation, so
// reduced motion needs nothing special. Real data only. Markup and styling only.

type Item = { label: string; value: number };

export default function BarList({ items, label }: { items: Item[]; label: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul aria-label={label} className="flex flex-col gap-3.5">
      {items.map(({ label: name, value }) => (
        <li key={name} className="min-w-0">
          <div className="mb-1 truncate text-sm font-medium text-ink">{name}</div>
          <div className="flex items-center gap-3">
            <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-subtle ring-1 ring-inset ring-border">
              <div className="h-full rounded-full bg-action" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-ink tabular-nums">{value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
