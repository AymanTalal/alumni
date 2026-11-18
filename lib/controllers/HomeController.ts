// Page-side controller for the homepage ("/"). Read-only: it asks the Models for the counts and the
// newest records and returns them as one plain object. No SQL and no rules here — those stay in
// the Models. Database errors are not caught: like the other pages' lists, the page fails and
// Next.js shows its error page (and logs the error).

import { countAnnouncements, getLatestAnnouncements, type Announcement } from "@/lib/models/announcement";
import { countApplications, getAllApplications } from "@/lib/models/application";
import { countJobPostings, getLatestJobPostings, type JobPosting } from "@/lib/models/jobPosting";
import { countDepartments, countUsers, countUsersByDepartment, getNewestUsers, type User } from "@/lib/models/user";

// How many newest records the homepage shows
export const LATEST_JOB_POSTINGS = 3;
export const LATEST_ANNOUNCEMENTS = 2;
export const RECENTLY_JOINED = 3; // the stack in the hero
export const MEET_PEOPLE = 4; // the "Meet our graduates" row, the next newest after the hero's
export const TOP_DEPARTMENTS = 5;

export type HomeOverview = {
  // The users table has no graduate / student field, so the homepage counts "people" (all users)
  counts: { people: number; departments: number; jobPostings: number; applications: number; announcements: number };
  recentlyJoined: User[]; // the newest users, for the hero
  people: User[]; // the next newest users (never the same as recentlyJoined), for "Meet our graduates"
  departments: { department: string; count: number }[]; // the largest departments first
  // The newest postings, each with its number of applications (for the job cards)
  latestJobPostings: (JobPosting & { applicationCount: number })[];
  latestAnnouncements: Announcement[];
};

export async function getOverview(): Promise<HomeOverview> {
  const [
    people,
    departmentCount,
    jobPostings,
    applications,
    announcements,
    latest,
    latestAnnouncements,
    all,
    newest,
    departments,
  ] = await Promise.all([
    countUsers(),
    countDepartments(),
    countJobPostings(),
    countApplications(),
    countAnnouncements(),
    getLatestJobPostings(LATEST_JOB_POSTINGS),
    getLatestAnnouncements(LATEST_ANNOUNCEMENTS),
    getAllApplications(),
    getNewestUsers(RECENTLY_JOINED + MEET_PEOPLE),
    countUsersByDepartment(TOP_DEPARTMENTS),
  ]);

  // Each newest posting's applications, counted from the existing list (no new query)
  const countFor = (jobPostingId: number) =>
    all.applications.filter((application) => application.jobPostingId === jobPostingId).length;

  return {
    counts: { people, departments: departmentCount, jobPostings, applications, announcements },
    recentlyJoined: newest.slice(0, RECENTLY_JOINED),
    people: newest.slice(RECENTLY_JOINED),
    departments,
    latestJobPostings: latest.map((jobPosting) => ({ ...jobPosting, applicationCount: countFor(jobPosting.id) })),
    latestAnnouncements,
  };
}
