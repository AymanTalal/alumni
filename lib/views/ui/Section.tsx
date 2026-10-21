// Shared UI: a titled block inside a page (e.g. "Applications"), with an optional description.
// Markup and styling only.

type Props = { title: string; description?: React.ReactNode; children: React.ReactNode };

export default function Section({ title, description, children }: Props) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
