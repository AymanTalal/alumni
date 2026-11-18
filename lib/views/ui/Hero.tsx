import { pageWidthClasses } from "./PageContainer";

// Shared UI: the green hero band (DESIGN.md §9) — full width, the action green (--color-action) with
// white text; the yellow accent only as a short line above the title. Inside it, lined up with the
// page, two columns on a wide screen (stacked on a phone):
//   left  → an optional small eyebrow, the title (<h1>), the description (the promise) and the
//           actions (one onAction primary button + one onActionSecondary)
//   right → `aside` (e.g. the "Recently joined" stack of real people)
// `children` come below both columns. `overlap` adds room at the bottom for a card that sits half
// on the band and half on the page (the stats strip, StatsStrip). Put it first inside <main>.
// Markup only.

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  overlap?: boolean;
  children?: React.ReactNode;
};

export default function Hero({ eyebrow, title, description, actions, aside, overlap = false, children }: Props) {
  return (
    <section className="bg-action text-on-primary">
      <div className={`${pageWidthClasses()} pt-10 sm:pt-14 ${overlap ? "pb-20 sm:pb-24" : "pb-10 sm:pb-14"}`}>
        <div className={aside ? "grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]" : ""}>
          <div className="max-w-2xl">
            <span className="block h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            {eyebrow && <p className="mt-4 text-sm font-medium tracking-wide text-on-primary/85 uppercase">{eyebrow}</p>}
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 text-lg text-on-primary/90 sm:text-xl">{description}</p>}
            {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
