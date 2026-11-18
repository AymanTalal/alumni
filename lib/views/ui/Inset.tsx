// Shared UI: a light box inside a Panel (DESIGN.md §9) — for a small form that belongs to the panel's
// list, e.g. "Add application" under a posting's applicants. The subtle surface, a hairline border
// and the card radius, with an optional small title. Markup and styling only.

type Props = { title?: string; className?: string; children: React.ReactNode };

export default function Inset({ title, className = "", children }: Props) {
  return (
    <div className={`rounded-card border border-border bg-subtle p-4 sm:p-5 ${className}`}>
      {title && <h3 className="mb-4 font-semibold text-ink">{title}</h3>}
      {children}
    </div>
  );
}
