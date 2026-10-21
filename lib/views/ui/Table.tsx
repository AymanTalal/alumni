import type { ComponentProps } from "react";
import { cardClasses } from "./Card";

// Shared UI: a clean, compact dashboard-style table inside a card. On a narrow screen the table
// scrolls sideways inside its card, so the page itself never gets a horizontal scrollbar.
// Markup and styling only.

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cardClasses} overflow-x-auto`}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-subtle text-xs tracking-wide text-muted uppercase">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className = "", ...props }: ComponentProps<"th">) {
  return <th scope="col" className={`px-4 py-3 font-medium whitespace-nowrap ${className}`} {...props} />;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({ className = "", ...props }: ComponentProps<"tr">) {
  return <tr className={`align-top hover:bg-subtle ${className}`} {...props} />;
}

export function Td({ className = "", ...props }: ComponentProps<"td">) {
  return <td className={`px-4 py-3 ${className}`} {...props} />;
}
