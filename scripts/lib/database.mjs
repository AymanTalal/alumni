// Shared database helpers for the command-line scripts (migrate.mjs, seed.mjs).
// Reads DATABASE_URL, connects with pg, and reports problems clearly without ever printing the password.

import pg from "pg";

// Stops with a clear message (exit code 1)
export function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

// Describes where we connect to WITHOUT the password, e.g. "alumni@localhost:5432/alumni"
export function describe(url) {
  try {
    const u = new URL(url);
    return `${decodeURIComponent(u.username) || "?"}@${u.hostname}:${u.port || 5432}${u.pathname}`;
  } catch {
    return "(DATABASE_URL is not a valid URL)";
  }
}

// Reads DATABASE_URL, loading a local .env file first if it isn't set (running a script on your machine).
// `command` is used in the help text, e.g. "npm run migrate".
export function getDatabaseUrl(command) {
  if (!process.env.DATABASE_URL && typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(".env");
    } catch {
      // no .env file: that's fine, DATABASE_URL may still be missing (handled below)
    }
  }
  const url = process.env.DATABASE_URL;
  const example = `DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE ${command}`;
  if (!url) {
    fail(
      "DATABASE_URL is not set.\n" +
        `  Copy .env.example to .env (cp .env.example .env), or set DATABASE_URL, e.g.\n  ${example}`,
    );
  }
  if (!/^postgres(ql)?:\/\//.test(url) || !URL.canParse(url)) {
    fail(`DATABASE_URL is not a valid postgresql:// URL. Expected something like:\n  ${example}`);
  }
  return url;
}

// Opens a connection, or stops with a clear reason and hint. Returns the connected pg client.
export async function connect(url) {
  const target = describe(url);
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000 });

  try {
    await client.connect();
  } catch (error) {
    // A refused connection can arrive as an AggregateError with an empty message
    const reason =
      error.message || error.errors?.map((e) => e.message).join("; ") || error.code || "unknown error";
    const hint =
      error.code === "28P01" || error.code === "3D000"
        ? "Check the user, password and database name in DATABASE_URL."
        : "Is the database running? Start it with: docker compose up -d db";
    fail(`Could not connect to the database at ${target}.\n  Reason: ${reason}\n  ${hint}`);
  }
  console.log(`Connected to ${target}`);
  return client;
}
