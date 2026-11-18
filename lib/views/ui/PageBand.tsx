import Link from "next/link";
import Chip from "./Chip";
import { pageWidthClasses } from "./PageContainer";

// Shared UI: the page header band (DESIGN.md §9) — every page except the homepage starts with it,
// a smaller cousin of the homepage hero: the action green (--color-action) with white text, the
// yellow accent only as a short line. Inside, lined up with the page: an optional "← back" link,
// an eyebrow, the title (<h1>), one short line, the count as a quiet chip, and the actions on the
// right (the view's ONE primary button as ButtonLink variant="onAction"; secondary on green as
// "onActionSecondary"; Delete may stay "danger"). A detail page leaves the title out and puts it in
// its DetailHeader card, which overlaps the band (`overlap`). Pass it to PageContainer's `band`.
// Markup only.

type Props = {
  title?: string;
  eyebrow?: string;
  description?: React.ReactNode;
  count?: string; // a real count, e.g. "11 people"
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  width?: "narrow" | "wide";
  overlap?: boolean; // leave room at the bottom for a card that overlaps the band
};

export default function PageBand({ title, eyebrow, description, count, back, actions, width = "wide", overlap = false }: Props) {
  return (
    <section className="bg-action text-on-primary">
      <div className={`${pageWidthClasses(width)} pt-7 sm:pt-9 ${overlap ? "pb-20 sm:pb-24" : "pb-8 sm:pb-10"}`}>
        {back && (
          <Link
            href={back.href}
            className="inline-block rounded-control text-sm font-medium text-on-primary/90 underline-offset-4 hover:text-on-primary hover:underline"
          >
            ← {back.label}
          </Link>
        )}
        <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4 ${back ? "mt-4" : ""}`}>
          <div className="min-w-0">
            <span className="block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
            {eyebrow && <p className="mt-3 text-sm font-medium tracking-wide text-on-primary/85 uppercase">{eyebrow}</p>}
            {title && <h1 className="mt-2 text-3xl font-semibold tracking-tight break-words sm:text-4xl">{title}</h1>}
            {description && <div className="mt-2 text-on-primary/90">{description}</div>}
            {count && (
              <div className="mt-3">
                <Chip tone="onAction">{count}</Chip>
              </div>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
