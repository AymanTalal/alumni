// Shared UI: a small metadata chip (DESIGN.md, Richer layer v2) — a department, a city, a date, a
// count — optionally with a small icon. Quieter than a Badge (Badge is for statuses). Colors from the
// brand tokens only. Markup and styling only.

export type ChipTone = "neutral" | "primary" | "accent" | "onAction";

const TONES: Record<ChipTone, string> = {
  neutral: "bg-subtle text-muted ring-border",
  primary: "bg-primary-soft text-primary-hover ring-primary/15",
  accent: "bg-accent-soft text-on-accent ring-accent/60",
  onAction: "bg-on-primary/15 text-on-primary ring-on-primary/25", // on the green bands
};

type Props = { tone?: ChipTone; icon?: React.ReactNode; children: React.ReactNode };

export default function Chip({ tone = "neutral", icon, children }: Props) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}
