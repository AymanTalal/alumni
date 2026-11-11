"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

// Shared UI: shows the path that was asked for, e.g. "/jobs/abc" (never the query string).
// A Client Component because a not-found page gets no props, and usePathname is how the Next.js
// docs say to show path-based content on it. Markup only.
//
// The generic 404 page is rendered once at build time, so its HTML can't contain the path someone
// will ask for later. The path is therefore shown only in the browser: the first render (on the
// server, and while React takes over the HTML) shows "this address", then the real path — so the
// HTML and the browser always agree (no hydration mismatch).

const subscribe = () => () => {};

export default function RequestedPath() {
  const pathname = usePathname();
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  return (
    <code className="rounded-control bg-subtle px-1.5 py-0.5 text-sm break-all text-ink">
      {inBrowser ? pathname : "this address"}
    </code>
  );
}
