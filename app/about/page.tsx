import { ButtonLink } from "@/lib/views/ui/Button";
import IconCircle, { type IconTone } from "@/lib/views/ui/IconCircle";
import { ArrowRightIcon, BriefcaseIcon, BuildingIcon, ClipboardIcon, MegaphoneIcon, UsersIcon } from "@/lib/views/ui/icons";
import LinkCard from "@/lib/views/ui/LinkCard";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";

// Route: "/about"  (file: app/about/page.tsx)
// What IU Alumni is, who it is for, and what you can do here, in the BRAND.md voice (name, promise,
// plain sentences): the page band with the one primary button "Find a graduate", then panels
// (DESIGN.md §9).

export const metadata = { title: "About" };

const SECTIONS: { href: string; label: string; text: string; icon: React.ReactNode; tone: IconTone }[] = [
  { href: "/users", label: "Graduates & students", text: "Find a graduate, or add one to the directory.", icon: <UsersIcon />, tone: "primary" },
  { href: "/jobs", label: "Job postings", text: "See the jobs shared with IU graduates, or post a new one.", icon: <BriefcaseIcon />, tone: "accent" },
  { href: "/applications", label: "Applications", text: "See who applied to which job posting.", icon: <ClipboardIcon />, tone: "neutral" },
  { href: "/announcements", label: "Announcements", text: "Read news and events from the university.", icon: <MegaphoneIcon />, tone: "primary" },
];

export default function AboutPage() {
  return (
    <PageContainer
      overlap
      band={
        <PageBand
          overlap
          eyebrow="İstanbul Üniversitesi"
          title="About IU Alumni"
          description="Every IU graduate, one step away."
          actions={
            <ButtonLink href="/users" variant="onAction">
              Find a graduate
            </ButtonLink>
          }
        />
      }
    >
      <Panel title="What IU Alumni is" icon={<BuildingIcon />}>
        <p className="leading-relaxed text-ink">
          IU Alumni is the alumni platform of Istanbul University. It helps the university keep in touch
          with its graduates, lets students reach the people who studied before them, and gives staff one
          place to share news and job postings.
        </p>
      </Panel>

      <Panel title="What you can do here" icon={<ArrowRightIcon />} iconTone="neutral">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ href, label, text, icon, tone }) => (
            <li key={href} className="min-w-0">
              <LinkCard href={href} className="flex h-full items-start gap-4">
                <IconCircle tone={tone} size="lg">
                  {icon}
                </IconCircle>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink group-hover:text-primary">{label}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
                <span className="shrink-0 self-center text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none">
                  <ArrowRightIcon size={18} />
                </span>
              </LinkCard>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="How it is built" icon={<ClipboardIcon />} iconTone="accent">
        <p className="leading-relaxed text-muted">
          IU Alumni is built step by step as the semester project of the Web Programming course (YBSB3001)
          at Istanbul University.
        </p>
      </Panel>
    </PageContainer>
  );
}
