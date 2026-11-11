// Redirect rules for PAGE URLs, in one place (used by proxy.ts). Returns the canonical path a
// request should be sent to with 308 (Permanent Redirect), or null if the path is fine as it is.
//
//   singular → plural:     /job → /jobs, /user/5/edit → /users/5/edit, /application → /applications,
//                          /announcement/2 → /announcements/2
//   uppercase → lowercase: /Jobs → /jobs, /USERS/3/Edit → /users/3/edit   (both rules in ONE step:
//                          /Job/3 → /jobs/3, never a chain of redirects)
//   trailing slash:        removed (Next.js itself already redirects /jobs/ → /jobs with 308 before
//                          the proxy runs; this only covers what reaches the proxy)
//
// Only the four known sections are touched; every other path (unknown pages, /api, /_next, files
// in public/) gets null and is never redirected — an unknown URL shows the 404 page instead.
// No loop is possible: the result is always a lowercase, plural, slash-free path, and for such a
// path this function returns null.

const SECTIONS = new Set(["users", "jobs", "applications", "announcements"]);
const SINGULAR: Record<string, string> = {
  user: "users",
  job: "jobs",
  application: "applications",
  announcement: "announcements",
};

export function canonicalPagePath(pathname: string): string | null {
  const segments = pathname.split("/").slice(1); // "/Job/3/" → ["Job", "3", ""]
  const first = (segments[0] ?? "").toLowerCase();
  const section = SECTIONS.has(first) ? first : SINGULAR[first];
  if (section === undefined) return null; // not one of the known sections: leave it alone

  const rest = segments.slice(1).filter((segment) => segment !== "").map((s) => s.toLowerCase());
  const target = "/" + [section, ...rest].join("/");
  return target === pathname ? null : target;
}
