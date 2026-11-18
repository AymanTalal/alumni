import Link from "next/link";
import type { ComponentProps } from "react";
import { cardClasses } from "./Card";

// Shared UI: a card that is ONE link (DESIGN.md §9, Richer layer v2) — the whole card is clickable,
// for browsing: a job posting, an announcement, a person, a section. "Life" on hover (and keyboard
// focus): it lifts 2px, its border turns the action green, its shadow deepens, and a thin YELLOW
// strip appears along its top edge — the accent as a small highlight, never as the border itself
// (BRAND.md). All in 150 ms; with prefers-reduced-motion it doesn't move and the strip appears
// without animation. `highlight` keeps the strip on (e.g. the newest job posting).
// Only real data goes inside (never decoration with made-up text). Markup and styling only.

export const linkCardClasses =
  `${cardClasses} group relative block overflow-hidden p-5 transition duration-150 ease-out ` +
  "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover " +
  "motion-reduce:transition-colors motion-reduce:hover:translate-y-0 " +
  // the yellow top strip (clipped to the rounded corners by overflow-hidden)
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-accent " +
  "before:opacity-0 before:transition-opacity before:duration-150 motion-reduce:before:transition-none " +
  "hover:before:opacity-100 focus-visible:before:opacity-100";

type Props = ComponentProps<typeof Link> & { highlight?: boolean };

export default function LinkCard({ className = "", highlight = false, ...props }: Props) {
  return <Link className={`${linkCardClasses} ${highlight ? "before:opacity-100" : ""} ${className}`} {...props} />;
}
