"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Shared UI: the main navigation links in the site header. The current section is highlighted
// (and marked with aria-current="page"). A Client Component only because usePathname, which
// tells which page is open, runs in the browser. Markup and styling only.

const LINKS = [
  { href: "/users", label: "Users" },
  { href: "/announcements", label: "Announcements" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-wrap gap-1">
      {LINKS.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
              current ? "bg-primary-soft text-primary-hover" : "text-muted hover:bg-subtle hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
