// Shared UI: an initials avatar (DESIGN.md, Richer layer v2) — for people (Ayşe Yılmaz → "AY") and
// companies (Trendyol → "T"). The tint is picked from the brand tints by the name itself, so the
// same name always gets the same color (no randomness, the same on the server and in the browser).
// Markup and styling only; the name is announced by the text next to it, so the avatar is hidden
// from screen readers.

// The brand tints (BRAND.md): light green, light yellow, light gray — each with a readable text color
const TINTS = [
  "bg-primary-soft text-primary-hover",
  "bg-accent-soft text-on-accent",
  "bg-subtle text-ink ring-1 ring-inset ring-border",
];

// The same name → the same tint (a small, stable hash of the letters)
function tintFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) % 9973;
  return TINTS[hash % TINTS.length];
}

// "Ayşe Yılmaz" → "AY", "Trendyol" → "T" (at most two letters, upper-cased in Turkish)
export function initialsOf(name: string, letters: 1 | 2 = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const picked = letters === 1 || words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return picked.map((word) => (word ? word[0] : "")).join("").toLocaleUpperCase("tr-TR") || "?";
}

type Props = {
  name: string;
  letters?: 1 | 2; // 1 for a company, 2 for a person
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square"; // square (rounded) for companies
};

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-xl" };

export default function Avatar({ name, letters = 2, size = "md", shape = "circle" }: Props) {
  const radius = shape === "square" ? "rounded-control" : "rounded-full";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-semibold ${radius} ${SIZES[size]} ${tintFor(name)}`}
    >
      {initialsOf(name, letters)}
    </span>
  );
}
