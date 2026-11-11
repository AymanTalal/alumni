import { ButtonLink } from "./Button";
import Card from "./Card";
import PageContainer from "./PageContainer";
import PageHeader from "./PageHeader";
import RequestedPath from "./RequestedPath";

// Shared UI: the ONE look of every "not found" page (HTTP 404) — the generic app/not-found.tsx and
// the section pages ("Job posting not found", …), which only pass their own title and reason.
// It shows the title, the reason, the path that was asked for, and links to the main sections.
// Markup only.

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/users", label: "Users" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/announcements", label: "Announcements" },
];

type Props = {
  title: string;
  reason: string;
  back?: { href: string; label: string };
};

export default function NotFoundView({ title, reason, back }: Props) {
  return (
    <PageContainer width="narrow">
      <PageHeader back={back} title={title} />
      <Card>
        <p className="font-medium text-ink">{reason}</p>
        <p className="mt-2 text-sm text-muted">
          You asked for <RequestedPath />. Check the link, or go to one of these pages:
        </p>
        <nav aria-label="Pages" className="mt-5 flex flex-wrap gap-2">
          {LINKS.map(({ href, label }) => (
            <ButtonLink key={href} href={href} variant={href === "/" ? "primary" : "secondary"} size="sm">
              {label}
            </ButtonLink>
          ))}
        </nav>
      </Card>
    </PageContainer>
  );
}
