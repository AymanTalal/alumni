import Image from "next/image";
import Link from "next/link";
import NavLinks from "./NavLinks";

// Shared UI: the header on every page (rendered by app/layout.tsx): the university logo and the
// project name (linking home), and the main navigation. On a phone the navigation wraps below the
// name. A thin yellow line from the logo's colors is the only use of the accent here.
// Markup and styling only.

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="h-1 bg-accent" aria-hidden="true" />
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-control">
          <Image
            src="/logo.png"
            alt="İstanbul Üniversitesi logo"
            width={40}
            height={40}
            loading="eager"
          />
          <span className="leading-tight">
            <span className="block font-semibold text-ink">Alumni Tracking System</span>
            <span className="block text-xs text-muted">İstanbul Üniversitesi</span>
          </span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
