// Database migration runner: plain SQL files, no ORM or migration framework.
//
//   node scripts/migrate.mjs up     (npm run migrate)       apply every pending migration, in order
//   node scripts/migrate.mjs down   (npm run migrate:down)  roll back only the most recent migration
//
// Migrations live in migrations/ as numbered pairs, e.g.
//   001_create_users.up.sql / 001_create_users.down.sql
// Applied migrations are recorded by name (e.g. "001_create_users") in the schema_migrations table.
// Connects with the DATABASE_URL environment variable (see .env.example).

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { connect, fail, getDatabaseUrl } from "./lib/database.mjs";

const MIGRATIONS_DIR = fileURLToPath(new URL("../migrations/", import.meta.url));
const UP_FILE = /^(\d+_[\w-]+)\.up\.sql$/;

// Every migration in migrations/, sorted by number: [{ name, upFile, downFile }]
async function listMigrations() {
  const files = await readdir(MIGRATIONS_DIR);
  return files
    .map((file) => file.match(UP_FILE))
    .filter(Boolean)
    .map((match) => ({
      name: match[1],
      upFile: `${match[1]}.up.sql`,
      downFile: `${match[1]}.down.sql`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
}

// Runs one migration file and updates schema_migrations, inside a single transaction:
// if anything fails, nothing from this migration is kept.
async function runInTransaction(client, sql, record) {
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(record.text, record.values);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

// up: applies every migration that isn't recorded in schema_migrations yet, in order
async function up(client) {
  const applied = new Set(
    (await client.query("SELECT name FROM schema_migrations")).rows.map((row) => row.name),
  );
  const pending = (await listMigrations()).filter((m) => !applied.has(m.name));

  if (pending.length === 0) {
    console.log("✔ No pending migrations. The database is up to date.");
    return;
  }

  for (const migration of pending) {
    const sql = await readFile(MIGRATIONS_DIR + migration.upFile, "utf8");
    await runInTransaction(client, sql, {
      text: "INSERT INTO schema_migrations (name) VALUES ($1)",
      values: [migration.name],
    });
    console.log(`↑ Applied ${migration.upFile}`);
  }
  console.log(`✔ Applied ${pending.length} migration(s).`);
}

// down: rolls back only the most recent applied migration
async function down(client) {
  const { rows } = await client.query(
    "SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1",
  );
  if (rows.length === 0) {
    console.log("✔ Nothing to roll back: no migrations have been applied.");
    return;
  }

  const { name } = rows[0];
  const migration = (await listMigrations()).find((m) => m.name === name);
  if (!migration) fail(`Can't roll back "${name}": its files are missing from migrations/.`);

  let sql;
  try {
    sql = await readFile(MIGRATIONS_DIR + migration.downFile, "utf8");
  } catch {
    fail(`Can't roll back "${name}": migrations/${migration.downFile} is missing.`);
  }
  await runInTransaction(client, sql, {
    text: "DELETE FROM schema_migrations WHERE name = $1",
    values: [name],
  });
  console.log(`↓ Rolled back ${migration.downFile}`);
}

async function main() {
  const command = process.argv[2] ?? "up";
  if (command !== "up" && command !== "down") {
    fail(`Unknown command "${command}". Use "up" (npm run migrate) or "down" (npm run migrate:down).`);
  }

  const client = await connect(getDatabaseUrl(command === "up" ? "npm run migrate" : "npm run migrate:down"));

  try {
    // Records which migrations have been applied (created on the first run)
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text        PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await (command === "up" ? up(client) : down(client));
  } catch (error) {
    fail(`Migration failed: ${error.message}`);
  } finally {
    await client.end();
  }
}

main();
