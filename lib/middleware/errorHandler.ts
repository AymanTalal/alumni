// Error handler middleware: catches every error a route handler, a controller, a Model or another
// middleware lets go, and answers ONE safe JSON shape. Controllers don't need their own try/catch
// for unexpected errors: they just let them go, and this handler catches them.
//
//   the database can't be reached → 503 { "error": "service unavailable",
//                                         "reason": "The database is not reachable. Try again later." }
//   any other unexpected error   → 500 { "error": "internal error" }
//
// The full error (message and stack) is logged ONCE on the server, with the method and path, so it
// can be found with `docker compose logs app`, and appended as one entry to logs/error.log
// (lib/log/errorFile.ts); the response body never contains it.
//
// One kind of database error is not a server error: a value the database rejects because of the
// data that was sent (a duplicate, a foreign key, a CHECK, a number out of range, …). It is answered
// with today's 400 { "error": "<clear message>" } from lib/controllers/databaseErrors.ts, not logged.
// Used through the middleware lines in lib/middleware/index.ts, right after the logger.

import { NextResponse } from "next/server";
import { clientErrorMessage } from "@/lib/controllers/databaseErrors";
import { internalError, serviceUnavailable } from "@/lib/http/serverError";
import { appendErrorEntry } from "@/lib/log/errorFile";
import type { Middleware, RouteHandler } from "./chain";

// Error codes meaning "the database can't be reached" (not "the query was wrong"):
//   - from Node's network layer, which the pg driver passes on: the host name can't be resolved
//     (ENOTFOUND, EAI_AGAIN — e.g. the db container is stopped), the connection is refused, reset
//     or times out
//   - from PostgreSQL itself: class 08 (connection exception), 57P01–57P03 (the server is shutting
//     down or starting up) and 53300 (too many connections)
const UNREACHABLE_CODES = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "57P01",
  "57P02",
  "57P03",
  "53300",
]);

// Messages the pg driver uses (without a code) when a connection breaks or can't be opened in time
const UNREACHABLE_MESSAGES = [
  "Connection terminated",
  "timeout exceeded when trying to connect",
];

function isDatabaseUnreachable(error: unknown, depth = 0): boolean {
  if (typeof error !== "object" || error === null || depth > 3) return false;
  const { code, message, errors, cause } = error as {
    code?: unknown;
    message?: unknown;
    errors?: unknown;
    cause?: unknown;
  };
  if (typeof code === "string" && (UNREACHABLE_CODES.has(code) || code.startsWith("08"))) return true;
  if (typeof message === "string" && UNREACHABLE_MESSAGES.some((text) => message.includes(text))) {
    return true;
  }
  // Node reports one failed attempt per address as an AggregateError, or wraps the cause
  if (Array.isArray(errors) && errors.some((inner) => isDatabaseUnreachable(inner, depth + 1))) {
    return true;
  }
  return isDatabaseUnreachable(cause, depth + 1);
}

// Writes the full error to the terminal once and appends one entry to logs/error.log, with the
// method and the path (never the query string, body or headers). Logging can never break the answer.
async function logServerError(request: Request, status: number, error: unknown) {
  let path: string;
  try {
    path = new URL(request.url).pathname;
    console.error(`${request.method} ${path} → ${status}, unexpected error:`, error);
  } catch {
    return; // never let logging break the answer
  }
  await appendErrorEntry({ method: request.method, path, status, error }); // never throws
}

export const withErrorHandler: Middleware = <Rest extends unknown[]>(handler: RouteHandler<Rest>) =>
  async (request: Request, ...rest: Rest) => {
    try {
      return await handler(request, ...rest); // the next step: the 404 guard / the controller
    } catch (error) {
      // A value the database rejected because of the sent data: a client mistake, today's 400
      const clientMessage = clientErrorMessage(error);
      if (clientMessage !== null) {
        return NextResponse.json({ error: clientMessage }, { status: 400 });
      }

      const unreachable = isDatabaseUnreachable(error);
      await logServerError(request, unreachable ? 503 : 500, error);
      return unreachable ? serviceUnavailable() : internalError();
    }
  };
