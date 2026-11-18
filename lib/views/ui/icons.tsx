import type { SVGProps } from "react";

// Shared UI: the small icon set (DESIGN.md, Richer layer v2) — plain inline SVG, no icon library.
// Every icon is a 24×24 outline drawn with `currentColor`, so it takes the color of the text around
// it (a token class like text-primary), never a color of its own. Icons are decoration next to text,
// so they are hidden from screen readers (aria-hidden) unless a `title` is given.
// Markup only.

type IconProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function Icon({ size = 20, title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// People (graduates and students)
export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
      <path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </Icon>
  );
}

// Job postings
export function BriefcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M3 12.5h18" />
    </Icon>
  );
}

// Departments
export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-5h6v5" />
      <path d="M9.5 11h.01M14.5 11h.01" />
    </Icon>
  );
}

// Applications
export function ClipboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 4.5V3.8A.8.8 0 0 1 9.8 3h4.4a.8.8 0 0 1 .8.8v.7" />
      <path d="m9 13 2 2 4-4" />
    </Icon>
  );
}

// Announcements
export function MegaphoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M17 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M19.5 7a7 7 0 0 1 0 10" />
    </Icon>
  );
}

// A date (posted on …)
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Icon>
  );
}

// A place (city)
export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </Icon>
  );
}

// "Go there"
export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

// A person (one applicant, an author)
export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Icon>
  );
}

// Waiting (a pending application)
export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}

// Yes (an accepted application)
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}

// No (a rejected application)
export function CrossIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Icon>
  );
}

// The empty-state illustration: an open, empty tray with a soft circle behind it. Drawn with the
// tokens (fill-primary-soft, text-primary / text-border-strong), 96×96, decoration only.
export function EmptyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="48" cy="48" r="40" className="fill-primary-soft" />
      <path
        d="M22 52 30 34a4 4 0 0 1 3.7-2.5h28.6A4 4 0 0 1 66 34l8 18v12a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V52Z"
        className="fill-surface stroke-primary"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M22 52h14l3 6h18l3-6h14"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 24v-6M48 22v-8M56 24v-6" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
