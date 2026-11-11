import { NextResponse } from "next/server";
import { withApiMiddleware } from "@/lib/middleware";

// GET "/api/health" → JSON { "status": "ok" }
// NextResponse.json() serializes the object and sets Content-Type: application/json.
// Every handler goes through the API middleware line (lib/middleware): the logger, then the error
// handler (503 / 500 for unexpected errors).
export const GET = withApiMiddleware(() =>
  NextResponse.json({ status: "ok" }),
);
