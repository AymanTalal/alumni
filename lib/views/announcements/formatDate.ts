// View helper (presentation only; the dates themselves come from the Model).
// The short date tables and lists use (DESIGN.md, the table), e.g. "10 Oct 2026" (UTC)
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
