import EmptyState from "./EmptyState";
import PageBand from "./PageBand";
import PageContainer from "./PageContainer";
import RequestedPath from "./RequestedPath";
import TextLink from "./TextLink";

// Shared UI: the ONE look of every "not found" page (HTTP 404) — the generic app/not-found.tsx and
// the section pages ("We couldn't find that job posting.", …), which only pass their own title and
// reason. DESIGN.md §9: the page band with the title, then the shared empty state over it — the
// illustration, the reason, the path that was asked for, quiet links to the main sections, and ONE
// button home (the view's primary). Text in the BRAND.md voice: say what happened, then what to do
// next. Markup only.

const LINKS = [
  { href: "/users", label: "Graduates & students" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/announcements", label: "Announcements" },
];

type Props = {
  title: string; // e.g. "We couldn't find that page."
  reason: string; // e.g. "The address may be mistyped, or the page may have moved."
  back?: { href: string; label: string };
};

export default function NotFoundView({ title, reason, back }: Props) {
  return (
    <PageContainer
      width="narrow"
      overlap
      band={<PageBand width="narrow" overlap back={back} eyebrow="Page not found" title={title} />}
    >
      <EmptyState title={reason} action={{ href: "/", label: "Go to the home page" }}>
        <p>
          You asked for <RequestedPath />. Check the link, or go to one of these pages:
        </p>
        <nav aria-label="Pages" className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LINKS.map(({ href, label }) => (
            <TextLink key={href} href={href}>
              {label}
            </TextLink>
          ))}
        </nav>
      </EmptyState>
    </PageContainer>
  );
}
