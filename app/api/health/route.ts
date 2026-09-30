import { NextResponse } from "next/server";

// GET "/api/health" → JSON { "status": "ok" }
// NextResponse.json() serializes the object and sets Content-Type: application/json.
export function GET() {
  return NextResponse.json({ status: "ok" });
}
