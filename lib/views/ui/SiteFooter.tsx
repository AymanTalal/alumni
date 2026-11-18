import Image from "next/image";
import Link from "next/link";
import { pageWidthClasses } from "./PageContainer";

// Shared UI: the footer on every page (rendered by app/layout.tsx, below the page) — DESIGN.md §9.
// The action green with white text (6.0:1), the yellow accent as a thin line along its top, the
// university logo, "IU Alumni · İstanbul Üniversitesi", the promise and the main links (the four
// sections, About, the API docs). Our colors only. Markup and styling only.

const LINKS = [
  { href: "/users", label: "Graduates & students" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/announcements", label: "Announcements" },
  { href: "/about", label: "About" },
  { href: "/api/swagger", label: "API docs" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-action text-on-primary">
      <div className="h-1 bg-accent" aria-hidden="true" />
      <div className={`${pageWidthClasses()} flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="İstanbul Üniversitesi logo" width={36} height={36} />
          <div className="leading-tight">
            <p className="font-semibold">IU Alumni · İstanbul Üniversitesi</p>
            <p className="mt-1 text-sm text-on-primary/90">Every IU graduate, one step away.</p>
          </div>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-control text-on-primary/90 underline-offset-4 hover:text-on-primary hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
