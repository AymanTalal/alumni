// View helper: formats an ISO date like "2026-10-10T15:24:58.099Z" for display, e.g.
// "10/10/2026, 15:24:58 UTC". Presentation only; the dates themselves come from the Model.
export function formatDate(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", { timeZone: "UTC" })} UTC`;
}
