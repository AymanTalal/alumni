import Link from "next/link";
import type { ComponentProps } from "react";

// Shared UI: an inline text link in the brand green (names, titles, "← back" links).
// Markup and styling only; the color comes from the theme tokens in app/globals.css.

export const textLinkClasses = "font-medium text-primary hover:text-primary-hover hover:underline";

export default function TextLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link className={`${textLinkClasses} ${className}`} {...props} />;
}
