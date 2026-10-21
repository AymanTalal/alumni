// Seed script: fills the database with sample users, announcements and job postings built by the
// factories.
//
//   node scripts/seed.mjs           (npm run seed)        seed users and announcements only if both
//                                                         tables are empty, and job postings only if
//                                                         job_postings is empty
//   node scripts/seed.mjs --fresh   (npm run seed:fresh)  delete all users, announcements and job
//                                                         postings (and so all applications), then seed
//
// Applications are not seeded. Job postings have no owner, so they are checked and cleared on their
// own: deleting users doesn't remove them.
//
// Plain SQL through pg, no ORM. Every insert uses parameters ($1, $2, …), never string concatenation.
// Connects with the DATABASE_URL environment variable (see .env.example). Refuses to run in production.

import { makeAnnouncements, resetAnnouncementFactory } from "./factories/announcementFactory.mjs";
import { makeJobPostings, resetJobPostingFactory } from "./factories/jobPostingFactory.mjs";
import { makeUsers, resetUserFactory } from "./factories/userFactory.mjs";
import { connect, fail, getDatabaseUrl } from "./lib/database.mjs";

const USER_COUNT = 10;
const ANNOUNCEMENT_COUNT = 8;
const JOB_POSTING_COUNT = 10;

// Inserts the users and returns how many were inserted
async function insertUsers(client, users) {
  for (const user of users) {
    await client.query(
      "INSERT INTO users (name, email, age, department, extra) VALUES ($1, $2, $3, $4, $5)",
      [user.name, user.email, user.age, user.department, JSON.stringify(user.extra)],
    );
  }
  return users.length;
}

// Inserts the announcements and returns how many were inserted
async function insertAnnouncements(client, announcements) {
  for (const announcement of announcements) {
    await client.query(
      "INSERT INTO announcements (title, content, author, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
      [
        announcement.title,
        announcement.content,
        announcement.author,
        announcement.createdAt,
        announcement.updatedAt,
      ],
    );
  }
  return announcements.length;
}

// Inserts the job postings and returns how many were inserted
async function insertJobPostings(client, jobPostings) {
  for (const jobPosting of jobPostings) {
    await client.query(
      "INSERT INTO job_postings (title, company, created_at, updated_at) VALUES ($1, $2, $3, $4)",
      [jobPosting.title, jobPosting.company, jobPosting.createdAt, jobPosting.updatedAt],
    );
  }
  return jobPostings.length;
}

async function main() {
  const args = process.argv.slice(2);
  const unknown = args.filter((arg) => arg !== "--fresh");
  if (unknown.length > 0) {
    fail(`Unknown option "${unknown[0]}". Use npm run seed, or npm run seed:fresh (--fresh) to reset first.`);
  }
  const fresh = args.includes("--fresh");

  // Sample data is for development only: never seed (or wipe) a production database
  if (process.env.NODE_ENV === "production") {
    fail(
      "Refusing to seed: NODE_ENV is \"production\".\n" +
        "  The seed inserts sample data and --fresh deletes all users, announcements and job postings,\n" +
        "  so it only runs in development.",
    );
  }

  const client = await connect(getDatabaseUrl(fresh ? "npm run seed:fresh" : "npm run seed"));

  try {
    // The tables are created by the migrations; stop with a clear message if they're missing
    const { rows: tables } = await client.query(
      "SELECT to_regclass('public.users') AS users, to_regclass('public.announcements') AS announcements, " +
        "to_regclass('public.job_postings') AS job_postings",
    );
    if (!tables[0].users || !tables[0].announcements || !tables[0].job_postings) {
      fail(
        "The users, announcements and job_postings tables don't exist yet.\n" +
          "  Run the migrations first: npm run migrate (or docker compose up, which runs them).",
      );
    }

    await client.query("BEGIN");
    try {
      // Locks the tables until the end of the transaction, so two seeds can't run at the same time
      await client.query("LOCK TABLE users, announcements, job_postings IN EXCLUSIVE MODE");

      // Which groups to seed: on --fresh everything; otherwise only what is still empty
      let seedUsersAndAnnouncements = true;
      let seedJobPostings = true;

      if (fresh) {
        // Deletes every row in these three tables, and restarts their ids at 1. job_postings is listed
        // itself because it no longer references users. CASCADE also empties applications, which
        // references users and job_postings. One TRUNCATE handles all of them, so the order doesn't matter.
        // Never touches schema_migrations and never drops anything.
        await client.query("TRUNCATE users, announcements, job_postings RESTART IDENTITY CASCADE");
        console.log("Deleted all users, announcements and job postings, and so all applications (--fresh).");
      } else {
        const { rows } = await client.query(
          "SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM announcements)::int AS announcements, " +
            "(SELECT count(*) FROM job_postings)::int AS job_postings",
        );
        const counts = rows[0];
        // Users and announcements behave as before: skipped together if either table has rows.
        // Job postings are skipped only if job_postings has rows.
        seedUsersAndAnnouncements = counts.users === 0 && counts.announcements === 0;
        seedJobPostings = counts.job_postings === 0;

        if (!seedUsersAndAnnouncements && !seedJobPostings) {
          await client.query("ROLLBACK");
          console.log(
            `✔ Already seeded (${counts.users} users, ${counts.announcements} announcements, ` +
              `${counts.job_postings} job postings), nothing changed. Use --fresh to reset (npm run seed:fresh).`,
          );
          return;
        }
        if (!seedUsersAndAnnouncements) {
          console.log(
            `Users and announcements already seeded (${counts.users} users, ${counts.announcements} announcements), skipped.`,
          );
        }
        if (!seedJobPostings) {
          console.log(`Job postings already seeded (${counts.job_postings} job postings), skipped.`);
        }
      }

      // Same data on every run: start the factories from their first value
      const seeded = [];
      if (seedUsersAndAnnouncements) {
        resetUserFactory();
        resetAnnouncementFactory();
        const userCount = await insertUsers(client, makeUsers(USER_COUNT));
        const announcementCount = await insertAnnouncements(client, makeAnnouncements(ANNOUNCEMENT_COUNT));
        seeded.push(`${userCount} users`, `${announcementCount} announcements`);
      }
      if (seedJobPostings) {
        resetJobPostingFactory();
        const jobPostingCount = await insertJobPostings(client, makeJobPostings(JOB_POSTING_COUNT));
        seeded.push(`${jobPostingCount} job postings`);
      }

      await client.query("COMMIT");
      console.log(`✔ Seeded ${seeded.join(", ")}.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    fail(`Seeding failed, nothing was changed: ${error.message}`);
  } finally {
    await client.end();
  }
}

main();
