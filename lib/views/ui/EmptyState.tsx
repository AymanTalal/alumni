// Shared UI: what a list shows when it has nothing in it: a short title and a hint about what
// to do next. Markup and styling only.

type Props = { title: string; children?: React.ReactNode };

export default function EmptyState({ title, children }: Props) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
