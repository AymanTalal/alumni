"use client"; // Error boundaries must be Client Components (Next.js docs: error.js, global-error)

import ServerErrorView from "@/lib/views/ui/ServerErrorView";
import "./globals.css";

// The 500 page for when the root layout itself fails (app/error.tsx can't catch that). It replaces
// the whole document, so it needs its own <html> and <body>, and it imports the global styles
// itself (the design tokens); it can't export metadata, so the tab title is a <title> element.
// Same look and text as app/error.tsx, without the site header.

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>We couldn&apos;t load this page · IU Alumni</title>
        <ServerErrorView onRetry={retry} digest={error.digest} />
      </body>
    </html>
  );
}
