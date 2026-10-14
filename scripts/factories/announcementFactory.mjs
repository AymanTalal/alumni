// Announcement factory: builds sample announcement objects for the "announcements" table
// (see migrations/002_create_announcements.up.sql). It only builds plain objects — it never touches
// the database (scripts/seed.mjs does the inserting).
//
// In the migrations, `author` is free text (Option A in ddd.md), not a reference to a user,
// so the author is picked from a small list of names.
//
// Values are picked in order with a counter (no random values), so the same seed always produces
// the same announcements, including their dates.

const ANNOUNCEMENTS = [
  {
    title: "Alumni Reunion 2027",
    content:
      "Graduates of all years are invited to the annual alumni reunion on the Beyazıt campus on 12 June 2027.\nRegistration opens in March.",
  },
  {
    title: "Career Fair: Meet Our Partner Companies",
    content:
      "More than 40 companies will be at the spring career fair in the main hall. Alumni are welcome to attend as mentors or recruiters.",
  },
  {
    title: "Job Posting: Junior Data Analyst",
    content:
      "A partner company in Istanbul is hiring a junior data analyst. Graduates of MIS, Economics and Computer Engineering are encouraged to apply.",
  },
  {
    title: "Guest Lecture by an Alumna in Fintech",
    content:
      "A 2015 graduate now leading a fintech team will talk about building a career in financial technology. The lecture is open to students and alumni.",
  },
  {
    title: "New Mentorship Programme",
    content:
      "Alumni can now volunteer to mentor final-year students. Mentors meet their students once a month, online or on campus.",
  },
  {
    title: "Library Access for Graduates",
    content:
      "Graduates can now use the central library and its online databases with their alumni card. Ask at the front desk to activate it.",
  },
  {
    title: "Job Posting: Software Engineer (Remote)",
    content:
      "A software company founded by Istanbul University alumni is looking for a software engineer with experience in TypeScript and PostgreSQL.",
  },
  {
    title: "Alumni Newsletter: Autumn Edition",
    content:
      "The autumn newsletter is out, with graduate success stories, upcoming events and news from the faculties.",
  },
];
// One in every four announcements has no author, because author is optional
const AUTHORS = ["Alumni Office", "Career Center", "Faculty of Economics", null];

// Fixed starting date, so the seeded dates are always the same; each announcement is one day later
const FIRST_DATE = Date.UTC(2026, 8, 1, 9, 0, 0); // 1 September 2026, 09:00 UTC
const ONE_DAY = 24 * 60 * 60 * 1000;

// Counts the announcements built so far; the n-th announcement always gets the same values
let counter = 0;

// Starts the numbering again from the first announcement (so a new seed run repeats the same data)
export function resetAnnouncementFactory() {
  counter = 0;
}

// Builds one announcement: { title, content, author, createdAt, updatedAt }. createdAt / updatedAt
// are ISO dates one day apart, so "newest first" has a clear order. Any field in `overrides`
// replaces the generated value.
export function makeAnnouncement(overrides = {}) {
  const n = counter++;
  const { title, content } = ANNOUNCEMENTS[n % ANNOUNCEMENTS.length];
  const date = new Date(FIRST_DATE + n * ONE_DAY).toISOString();
  return {
    title,
    content,
    author: AUTHORS[n % AUTHORS.length],
    createdAt: date,
    updatedAt: date,
    ...overrides,
  };
}

// Builds `count` announcements with makeAnnouncement; `overrides` is applied to every one of them.
export function makeAnnouncements(count, overrides = {}) {
  return Array.from({ length: count }, () => makeAnnouncement(overrides));
}
