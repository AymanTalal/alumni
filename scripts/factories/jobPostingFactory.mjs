// Job posting factory: builds sample job posting objects for the "job_postings" table
// (see migrations/003_create_job_postings.up.sql and 004_drop_job_postings_user_id.up.sql).
// It only builds plain objects — it never touches the database (scripts/seed.mjs does the inserting).
//
// A job posting has no owner (no userId): users and postings are linked only through applications.
// Every title and company follows the JobPosting Model's rules (lib/models/jobPosting.ts): a
// non-blank title and company, each at most 200 characters, with no surrounding spaces.
//
// Values are picked in order with a counter (no random values), so the same seed always produces
// the same job postings, including their dates.

const TITLES = [
  "Junior Data Analyst",
  "Backend Developer Intern",
  "Frontend Developer (React)",
  "Business Analyst",
  "Software Engineer (TypeScript)",
  "IT Support Specialist",
  "Digital Marketing Specialist",
  "Junior Financial Analyst",
  "Product Manager Trainee",
  "Data Engineer",
  "UX/UI Designer",
  "Cloud Engineer Intern",
];
const COMPANIES = [
  "Trendyol",
  "Getir",
  "Turkcell",
  "Akbank",
  "Hepsiburada",
  "Peak Games",
  "Turkish Airlines",
  "Koç Holding",
  "Garanti BBVA",
  "Insider",
  "Papara",
];

// Fixed starting date, so the seeded dates are always the same; each posting is one day later
const FIRST_DATE = Date.UTC(2026, 9, 1, 9, 0, 0); // 1 October 2026, 09:00 UTC
const ONE_DAY = 24 * 60 * 60 * 1000;

// Counts the job postings built so far; the n-th posting always gets the same values
let counter = 0;

// Starts the numbering again from the first job posting (so a new seed run repeats the same data)
export function resetJobPostingFactory() {
  counter = 0;
}

// Builds one job posting: { title, company, createdAt, updatedAt }. createdAt / updatedAt are ISO
// dates one day apart, so "newest first" has a clear order. Any field in `overrides` replaces the
// generated value.
export function makeJobPosting(overrides = {}) {
  const n = counter++;
  const date = new Date(FIRST_DATE + n * ONE_DAY).toISOString();
  return {
    title: TITLES[n % TITLES.length],
    company: COMPANIES[(n * 3) % COMPANIES.length], // steps through the list in a different order
    createdAt: date,
    updatedAt: date,
    ...overrides,
  };
}

// Builds `count` job postings with makeJobPosting; `overrides` is applied to every one of them.
export function makeJobPostings(count, overrides = {}) {
  return Array.from({ length: count }, () => makeJobPosting(overrides));
}
