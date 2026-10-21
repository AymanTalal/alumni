import type { ComponentProps } from "react";

// Shared UI: a soft white card with a rounded border and a very light shadow.
// Markup and styling only; colors, radius and shadow come from the theme tokens.

export const cardClasses = "rounded-card border border-border bg-surface shadow-card";

export default function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`${cardClasses} p-5 sm:p-6 ${className}`} {...props} />;
}
