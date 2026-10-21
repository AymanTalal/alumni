import TextLink from "./TextLink";

// Shared UI: the top of a page: an optional "← back" link, the title (<h1>), an optional
// description under it, and optional actions (buttons) on the right, which wrap below the
// title on a phone. Markup and styling only.

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
};

export default function PageHeader({ title, description, back, actions }: Props) {
  return (
    <header className="mb-8">
      {back && (
        <TextLink href={back.href} className="text-sm">
          ← {back.label}
        </TextLink>
      )}
      <div className={`flex flex-wrap items-end justify-between gap-4 ${back ? "mt-4" : ""}`}>
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight break-words text-ink sm:text-4xl">{title}</h1>
          {description && <div className="mt-2 text-muted">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
