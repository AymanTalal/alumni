import { Button, ButtonLink } from "./Button";
import { EmptyIllustration } from "./icons";

// Shared UI: what a list shows when it has nothing in it — and the card of the error pages
// (DESIGN.md §4 and §9, built from the Linear reference's "one primary button per view" rule).
// Markup and styling only.
//   illustration → a small, simple inline SVG above the text; the shared EmptyIllustration unless
//                  another one is passed (or `false` for none)
//   title        → what happened, in our voice (BRAND.md): "No job postings yet."
//   children     → one sentence on what to do next: "Be the first to post one."
//   action       → optional, EXACTLY ONE primary button: a link ({ href, label }) or, in a Client
//                  Component, a button ({ onClick, label }, e.g. the 500 page's "Try again"). It is
//                  the view's one primary button: the page header shows no primary action of its own.
//   secondary    → optional, one secondary link next to it (e.g. "Go to the home page" on the 500 page)
// No emoji, no exclamation mark, no API routes in the text.

type Action = { href: string; label: string } | { onClick: () => void; label: string };

type Props = {
  title: string;
  children?: React.ReactNode;
  action?: Action;
  secondary?: { href: string; label: string };
  illustration?: React.ReactNode | false;
};

export default function EmptyState({ title, children, action, secondary, illustration }: Props) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
      {illustration !== false && (
        <div className="mb-4 flex justify-center">{illustration ?? <EmptyIllustration />}</div>
      )}
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
      {(action || secondary) && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {action &&
            ("href" in action ? (
              <ButtonLink href={action.href}>{action.label}</ButtonLink>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            ))}
          {secondary && (
            <ButtonLink href={secondary.href} variant="secondary">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}
