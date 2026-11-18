// Shared UI: a date as a small block — the day big, the month short under it — in the light green
// tint (DESIGN.md §9), for announcement cards and the announcement page. UTC, like the other dates.
// Markup and styling only.

export default function DateBlock({ iso, size = "md" }: { iso: string; size?: "md" | "lg" }) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" });
  const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  const box = size === "lg" ? "h-16 w-16" : "h-14 w-14";
  return (
    <div className={`flex ${box} shrink-0 flex-col items-center justify-center rounded-control bg-primary-soft text-primary-hover`}>
      <span className={`${size === "lg" ? "text-xl" : "text-lg"} leading-none font-semibold tabular-nums`}>{day}</span>
      <span className="mt-0.5 text-xs font-medium uppercase">{month}</span>
    </div>
  );
}
