import Card from "@/lib/views/ui/Card";
import PageContainer from "@/lib/views/ui/PageContainer";
import TextLink from "@/lib/views/ui/TextLink";

// Route: "/"  (file: app/page.tsx)
// Temporary homepage — will be replaced later in the course. The main navigation is in the
// site header (lib/views/ui/SiteHeader.tsx); these cards link to the same sections.

const SECTIONS = [
  { href: "/users", label: "Users", text: "Alumni and students in the system." },
  { href: "/announcements", label: "Announcements", text: "News and events for graduates." },
  { href: "/jobs", label: "Jobs", text: "Job postings from partner companies." },
  { href: "/applications", label: "Applications", text: "Who applied to which job posting." },
];

export default function HomePage() {
  return (
    <PageContainer>
      <section className="py-6 text-center sm:py-12">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Alumni Tracking System
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Keeping Istanbul University connected with its graduates.
        </p>
      </section>

      <nav aria-label="Sections" className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, label, text }) => (
          <Card key={href}>
            <h2 className="text-lg font-semibold">
              <TextLink href={href}>{label}</TextLink>
            </h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </nav>
    </PageContainer>
  );
}
