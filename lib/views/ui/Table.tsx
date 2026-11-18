import type { ComponentProps } from "react";
import { cardClasses } from "./Card";

// Shared UI: the table (DESIGN.md §3, built from the Stripe reference's hairlines, white canvas
// and quiet headers). Markup and styling only.
//   - one white card around it; a WHITE header with quiet labels: text-xs, uppercase, muted
//   - 1px hairlines (--color-border) under the header and between rows; no zebra stripes
//   - rows about 48px high, content vertically centred; hover --color-subtle
//   - text left; numbers right with tabular figures: <Th numeric> / <Td numeric>
//   - the actions column right-aligned: <Th align="right"> / <Td align="right">
//   - on a phone the table keeps its columns and scrolls sideways INSIDE its card, so the page
//     itself never scrolls sideways; header labels never wrap
// Column labels are plain words written by the views ("Email", "Applied"), never field names.

type Align = "left" | "right";

// numeric → right-aligned with tabular figures (ids, ages, counts); otherwise the given alignment
function alignClasses(numeric: boolean | undefined, align: Align | undefined) {
  if (numeric) return "text-right tabular-nums";
  return align === "right" ? "text-right" : "text-left";
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cardClasses} overflow-x-auto`}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
      <tr>{children}</tr>
    </thead>
  );
}

type CellProps = { numeric?: boolean; align?: Align };

export function Th({ numeric, align, className = "", ...props }: ComponentProps<"th"> & CellProps) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium whitespace-nowrap ${alignClasses(numeric, align)} ${className}`}
      {...props}
    />
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({ className = "", ...props }: ComponentProps<"tr">) {
  return <tr className={`align-middle hover:bg-subtle ${className}`} {...props} />;
}

export function Td({ numeric, align, className = "", ...props }: ComponentProps<"td"> & CellProps) {
  return <td className={`px-4 py-3 ${alignClasses(numeric, align)} ${className}`} {...props} />;
}
