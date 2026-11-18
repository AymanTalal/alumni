// Shared UI: an icon in a soft tinted circle (DESIGN.md, Richer layer v2) — used by stat cards and
// link cards. The tints come from the brand tokens only. Markup and styling only.
//   primary → light green circle, green icon       accent → light yellow circle, dark-yellow icon
//   neutral → light gray circle, gray icon

export type IconTone = "primary" | "accent" | "neutral";

const TONES: Record<IconTone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-on-accent",
  neutral: "bg-subtle text-muted ring-1 ring-inset ring-border",
};

type Props = { tone?: IconTone; size?: "md" | "lg"; children: React.ReactNode };

export default function IconCircle({ tone = "primary", size = "md", children }: Props) {
  const box = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${box} ${TONES[tone]}`}>
      {children}
    </span>
  );
}
