// The 5xx answers of the whole JSON API, used by the error handler middleware
// (lib/middleware/errorHandler.ts). They never contain the error's message, stack trace, SQL,
// table or constraint names, or file paths — those are only logged on the server.
//
//   503 { "error": "service unavailable", "reason": "The database is not reachable. Try again later." }
//   500 { "error": "internal error" }

import { NextResponse } from "next/server";

// The database can't be reached (stopped, refusing connections, timing out)
export function serviceUnavailable() {
  return NextResponse.json(
    { error: "service unavailable", reason: "The database is not reachable. Try again later." },
    { status: 503 },
  );
}

// Any other unexpected error
export function internalError() {
  return NextResponse.json({ error: "internal error" }, { status: 500 });
}
