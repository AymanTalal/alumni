import { NextResponse } from "next/server";
import { logPageRequest } from "@/lib/middleware/logger";
import { canonicalPagePath } from "@/lib/routing/pageRedirect";

// Proxy (Next.js 16's name for the old "middleware.ts"): runs BEFORE every matching request.
//
// 1. Redirects (308, Permanent Redirect) to the canonical page URL, with the query string kept:
//    /job/3 → /jobs/3, /Jobs → /jobs, /user/5/edit → /users/5/edit (rules in
//    lib/routing/pageRedirect.ts). Unknown URLs are NOT redirected: they show the 404 page.
//
// 2. Writes one terminal line per PAGE request, in the same format as the API logger:
//
//   10:20:30 GET /jobs/1 - -          a page view (or a client-side navigation to it)
//   10:20:35 POST /jobs/new - -       a form submission (a Server Action is a POST to the page)
//
// The status and the duration are "-": a proxy runs before the page and only lets the request
// through (NextResponse.next()); Next.js doesn't give it the page's response, so it can't know the
// final status or how long the page took (see the README, Middleware section).
//
// Apart from the redirects it changes nothing: the request goes on untouched, and logging can never
// throw.
export function proxy(request: Request) {
  const url = new URL(request.url);
  const target = canonicalPagePath(url.pathname);
  if (target !== null) {
    logPageRequest(request, "308");
    url.pathname = target; // the query string (url.search) stays as it is
    return NextResponse.redirect(url, 308);
  }

  logPageRequest(request);
  return NextResponse.next();
}

// Which requests reach the proxy — and so can be redirected or logged (the pattern from the Next.js
// docs, plus files from public/):
//   - not /api/… (API routes have their own logger with the real status)
//   - not /_next/static, /_next/image or /favicon.ico (internal and static files)
//   - not paths with a dot, e.g. /logo.png (files in public/)
//   - not link prefetches (the next-router-prefetch / purpose: prefetch headers), so hovering or
//     showing links doesn't fill the terminal
//   - not the internal re-render after a form's Server Action redirects (e.g. to /jobs/24): Next.js
//     renders the target page through an internal request that carries the x-action-redirect
//     header, so a form submission gives ONE line (its POST). That header is Next.js-internal (not
//     in the docs); if a future version drops it, the only effect is one extra line.
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "header", key: "x-action-redirect" },
      ],
    },
  ],
};
