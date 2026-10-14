// Database connection: one shared PostgreSQL connection pool for the whole app.
// Plain SQL through the pg package — no ORM. The Models call query(); nothing else should.
//
// The pool is created lazily, on the first query, not when this file is imported, so
// `npm run build` and `docker build` work without a database. It is cached on globalThis so
// Next.js dev hot reloads (and the separate module copies Next.js loads for API routes and
// pages) reuse one pool instead of opening a new one each time.

import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

// Returns the shared pool, creating it on first use from DATABASE_URL.
function getPool(): Pool {
  if (globalForDb.pgPool) return globalForDb.pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Never include the connection string itself: it contains the password
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env (or set DATABASE_URL) so the app can reach PostgreSQL.",
    );
  }

  const pool = new Pool({ connectionString });
  // An idle connection that breaks (e.g. the database restarts) must not crash the app
  pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error.message);
  });
  globalForDb.pgPool = pool;
  return pool;
}

// Runs one parameterized SQL query and returns its rows.
// Always pass user input in `params` ($1, $2, …), never inside `text`.
export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<Row[]> {
  const result = await getPool().query<Row>(text, params);
  return result.rows;
}
