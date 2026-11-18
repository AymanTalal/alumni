import type { HomeOverview } from "@/lib/controllers/HomeController";
import type { User } from "@/lib/models/user";
import AnnouncementCard from "../announcements/AnnouncementCard";
import Avatar from "../ui/Avatar";
import BarList from "../ui/BarList";
import { ButtonLink } from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Hero from "../ui/Hero";
import LinkCard from "../ui/LinkCard";
import { BriefcaseIcon, BuildingIcon, ClipboardIcon, MegaphoneIcon, UsersIcon } from "../ui/icons";
import JobCard from "../jobs/JobCard";
import { pageWidthClasses } from "../ui/PageContainer";
import Panel from "../ui/Panel";
import StatsStrip from "../ui/StatsStrip";
import TextLink from "../ui/TextLink";
import PersonCard from "../users/PersonCard";

// View: the homepage ("/") — DESIGN.md §9. Markup only; every number, name and card is real data
// from HomeController (through app/page.tsx). Top to bottom:
//   1. the green hero, two columns: left the eyebrow, title, promise, ONE primary button ("Find a
//      graduate", white on green) and a secondary; right a "Recently joined" stack of the newest users
//   2. the stats strip: one white card over the band's bottom edge with the five counts
//   3. "Meet our community": 4 people cards (the next newest users)
//   4. "Latest job postings": 3 job cards, the newest with the yellow top strip and a "New" chip
//   5. on the light action-tint band, two columns (5 : 6, so both header rows fit on one line):
//      "People by department" (bars) and "Latest announcements" (2 cards)
// Empty lists show the shared EmptyState with a text link only, so the page keeps one primary button.
// (The users table has no graduate / student field, so both sections show all users.)

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

// The "Recently joined" stack in the hero: small white cards, slightly overlapping and offset
function RecentlyJoined({ users }: { users: User[] }) {
  if (users.length === 0) return null;
  const offsets = ["lg:ml-0", "lg:ml-10", "lg:ml-20", "lg:ml-28"];
  return (
    <div className="lg:pl-6">
      <p className="mb-3 text-sm font-medium text-on-primary/85">Recently joined</p>
      <ul className="flex flex-col">
        {users.map((user, index) => (
          <li
            key={user.id}
            className={`${index > 0 ? "-mt-2" : ""} ${offsets[index] ?? ""} relative max-w-sm`}
            style={{ zIndex: users.length - index }}
          >
            {/* The shared link card (hover lift, green border, yellow top strip), a bit smaller */}
            <LinkCard href={`/users/${user.id}`} className="flex items-center gap-3 p-3! text-ink shadow-card-hover">
              <Avatar name={user.name} size="md" />
              <span className="min-w-0">
                <span className="block truncate font-semibold group-hover:text-primary">{user.name}</span>
                <span className="block truncate text-sm text-muted">{user.department || "Department: Not given"}</span>
              </span>
            </LinkCard>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomeView({
  counts,
  recentlyJoined,
  people,
  departments,
  latestJobPostings,
  latestAnnouncements,
}: HomeOverview) {
  // "People", not "Alumni" / "Current students": the users table has no field that tells them apart
  const stats = [
    { label: "People", value: counts.people, icon: <UsersIcon size={18} /> },
    { label: "Departments", value: counts.departments, icon: <BuildingIcon size={18} /> },
    { label: "Job postings", value: counts.jobPostings, icon: <BriefcaseIcon size={18} /> },
    { label: "Applications", value: counts.applications, icon: <ClipboardIcon size={18} /> },
    { label: "Announcements", value: counts.announcements, icon: <MegaphoneIcon size={18} /> },
  ];

  return (
    <main className="flex-1">
      {/* 1. The hero, two columns */}
      <Hero
        eyebrow="İstanbul Üniversitesi"
        title="IU Alumni"
        description="Every IU graduate, one step away."
        overlap
        actions={
          <>
            <ButtonLink href="/users" variant="onAction">
              Find a graduate
            </ButtonLink>
            <ButtonLink href="/jobs" variant="onActionSecondary">
              Browse job postings
            </ButtonLink>
          </>
        }
        aside={<RecentlyJoined users={recentlyJoined} />}
      />

      {/* 2. The stats strip, over the band's bottom edge */}
      <StatsStrip items={stats} />

      <div className={`${pageWidthClasses()} flex flex-col gap-8 py-10 sm:py-12`}>
        {/* 3. Meet our community */}
        <Panel
          title="Meet our community"
          icon={<UsersIcon />}
          count={plural(counts.people, "person", "people")}
          seeAll={{ href: "/users", label: "See all" }}
        >
          {people.length === 0 ? (
            <EmptyState title="No more graduates to show yet.">
              <TextLink href="/users/new">Add a graduate to grow the directory.</TextLink>
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {people.map((user) => (
                <li key={user.id} className="min-w-0">
                  <PersonCard user={user} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 4. Latest job postings */}
        <Panel
          title="Latest job postings"
          icon={<BriefcaseIcon />}
          iconTone="accent"
          count={plural(counts.jobPostings, "job posting", "job postings")}
          seeAll={latestJobPostings.length > 0 ? { href: "/jobs", label: "See all" } : undefined}
        >
          {latestJobPostings.length === 0 ? (
            <EmptyState title="No job postings yet.">
              <TextLink href="/jobs/new">Be the first to post one.</TextLink>
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestJobPostings.map((jobPosting, index) => (
                <li key={jobPosting.id} className="min-w-0">
                  {/* the list is newest first: the first card gets the yellow strip and "New" */}
                  <JobCard jobPosting={jobPosting} applicationCount={jobPosting.applicationCount} newest={index === 0} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* 5. On the light action-tint band: departments and announcements, side by side */}
      <div className="border-y border-border bg-action-tint">
        <div className={`${pageWidthClasses()} grid grid-cols-1 gap-8 py-10 sm:py-12 lg:grid-cols-[5fr_6fr]`}>
          <Panel
            title="People by department"
            compact
            icon={<BuildingIcon />}
            count={plural(counts.departments, "department", "departments")}
            description={
              counts.departments > departments.length
                ? `The ${departments.length} largest, by number of people.`
                : "By number of people."
            }
          >
            {departments.length === 0 ? (
              <EmptyState title="No departments yet.">
                <TextLink href="/users/new">Add a graduate with their department.</TextLink>
              </EmptyState>
            ) : (
              <BarList
                label="People per department"
                items={departments.map(({ department, count }) => ({ label: department, value: count }))}
              />
            )}
          </Panel>

          <Panel
            title="Latest announcements"
            compact
            icon={<MegaphoneIcon />}
            count={plural(counts.announcements, "announcement", "announcements")}
            seeAll={latestAnnouncements.length > 0 ? { href: "/announcements", label: "See all" } : undefined}
          >
            {latestAnnouncements.length === 0 ? (
              <EmptyState title="No announcements yet.">
                <TextLink href="/announcements/new">Share the first news with our graduates.</TextLink>
              </EmptyState>
            ) : (
              <ul className="flex flex-col gap-4">
                {latestAnnouncements.map((announcement) => (
                  <li key={announcement.id} className="min-w-0">
                    <AnnouncementCard announcement={announcement} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
