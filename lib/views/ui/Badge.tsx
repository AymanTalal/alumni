import type { ApplicationStatus } from "@/lib/models/application";

// Shared UI: small rounded labels. Markup and styling only; colors come from the theme tokens.
//   StatusBadge: pending = yellow, accepted = green, rejected = red

export type BadgeTone = "neutral" | "primary" | "accent" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-muted ring-border",
  primary: "bg-primary-soft text-primary-hover ring-primary/20",
  accent: "bg-accent-soft text-on-accent ring-accent",
  danger: "bg-danger-soft text-danger ring-danger/20",
};

type BadgeProps = { tone?: BadgeTone; children: React.ReactNode };

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

// Which badge tone each application status gets
const STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  pending: "accent",
  accepted: "primary",
  rejected: "danger",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{status}</Badge>;
}
