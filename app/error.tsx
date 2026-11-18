"use client"; // Error boundaries must be Client Components (Next.js docs: error.js)

import ServerErrorView from "@/lib/views/ui/ServerErrorView";

// The designed 500 page for browsers: shown (with HTTP 500) when a page throws while rendering,
// e.g. when the database can't be reached. It renders inside the root layout, so the site header
// stays. retry() re-fetches and re-renders the page. The error's details are only in the server
// log (Next.js logs it); people see a plain message and the error's reference (digest).
// The JSON API is not affected: its errors are answered by the error handler middleware
// (500 / 503 JSON).

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ServerErrorView onRetry={retry} digest={error.digest} />;
}
