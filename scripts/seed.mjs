// Seed script: fills the database with sample users and announcements built by the factories.
//
//   node scripts/seed.mjs           (npm run seed)        seed only if both tables are empty
//   node scripts/seed.mjs --fresh   (npm run seed:fresh)  delete all users and announcements, then seed
//
// Plain SQL through pg, no ORM. Every insert uses parameters ($1, $2, …), never string concatenation.
// Connects with the DATABASE_URL environment variable (see .env.example). Refuses to run in production.

import { makeAnnouncements, resetAnnouncementFactory } from "./factories/announcementFactory.mjs";
import { makeUsers, resetUserFactory } from "./factories/userFactory.mjs";
import { connect, fail, getDatabaseUrl } from "./lib/database.mjs";

const USER_COUNT = 10;
const ANNOUNCEMENT_COUNT = 8;

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
        "  The seed inserts sample data and --fresh deletes all users and announcements,\n" +
        "  so it only runs in development.",
    );
  }

  const client = await connect(getDatabaseUrl(fresh ? "npm run seed:fresh" : "npm run seed"));

  try {
    // The tables are created by the migrations; stop with a clear message if they're missing
    const { rows: tables } = await client.query(
      "SELECT to_regclass('public.users') AS users, to_regclass('public.announcements') AS announcements",
    );
    if (!tables[0].users || !tables[0].announcements) {
      fail(
        "The users and announcements tables don't exist yet.\n" +
          "  Run the migrations first: npm run migrate (or docker compose up, which runs them).",
      );
    }

    await client.query("BEGIN");
    try {
      // Locks both tables until the end of the transaction, so two seeds can't run at the same time
      await client.query("LOCK TABLE users, announcements IN EXCLUSIVE MODE");

      if (fresh) {
        // Deletes every row in these two tables only, and restarts their ids at 1.
        // Never touches schema_migrations and never drops anything.
        await client.query("TRUNCATE users, announcements RESTART IDENTITY CASCADE");
        console.log("Deleted all users and announcements (--fresh).");
      } else {
        const { rows } = await client.query(
          "SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM announcements)::int AS announcements",
        );
        if (rows[0].users > 0 || rows[0].announcements > 0) {
          await client.query("ROLLBACK");
          console.log(
            `✔ Already seeded (${rows[0].users} users, ${rows[0].announcements} announcements), ` +
              "nothing changed. Use --fresh to reset (npm run seed:fresh).",
          );
          return;
        }
      }

      // Same data on every run: start both factories from their first value
      resetUserFactory();
      resetAnnouncementFactory();
      const userCount = await insertUsers(client, makeUsers(USER_COUNT));
      const announcementCount = await insertAnnouncements(client, makeAnnouncements(ANNOUNCEMENT_COUNT));

      await client.query("COMMIT");
      console.log(`✔ Seeded ${userCount} users and ${announcementCount} announcements.`);
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
