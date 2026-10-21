import Link from "next/link";
import type { ComponentProps } from "react";

// Shared UI: buttons. Markup and styling only. Every button and button-like link in the app uses
// these, so their look is defined once. Colors, radius and focus ring come from the theme tokens
// in app/globals.css.
//   primary   → green, for the main action of a page or form
//   secondary → white with a border, for other actions (Edit, Cancel, View)
//   danger    → red text and border, for Delete / Remove

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-control font-medium whitespace-nowrap " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-border-strong bg-surface text-ink hover:bg-subtle",
  danger: "border border-danger/30 bg-surface text-danger hover:bg-danger-soft hover:border-danger",
};

const SIZES: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-2.5 py-1 text-sm",
};

// The class list for a button of this variant and size (also used for links that look like buttons)
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

// A real <button> (type="button" unless set, so it never submits a form by accident)
export function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

// A link (navigation) that looks like a button, e.g. "New job posting" or "Edit"
export function ButtonLink({ variant, size, className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}
