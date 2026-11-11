// The ONE 404 answer of the whole JSON API:  { "error": "not found", "reason": "<clear sentence>" }
// e.g. notFound("No job posting with id 99999") or notFound("No route matches GET /api/doesnotexist").
// Used by the 404 guard (lib/middleware/notFoundGuard.ts), the catch-all route
// (app/api/[...path]/route.ts) and the API controllers, so every API 404 has the same shape.
// (The HTML pages keep their own "not found" pages.)

import { NextResponse } from "next/server";

export function notFound(reason: string) {
  return NextResponse.json({ error: "not found", reason }, { status: 404 });
}
