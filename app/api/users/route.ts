import { NextResponse } from "next/server";
import { getNextId, readFormFields, users, type User } from "@/lib/users";

// GET  "/api/users" → returns all users added so far as a JSON array ([] if none yet)
// POST "/api/users" → creates a user from ALL form-data fields and returns it as JSON (201 Created)
// The users array lives in lib/users.ts so /api/users/[id] can read and update it too.

export function GET() {
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const fields = await readFormFields(request);
  if (fields === null) {
    return NextResponse.json(
      { error: "Request body must be form-data" },
      { status: 400 },
    );
  }

  const { name } = fields;
  if (name === undefined || name.trim() === "") {
    return NextResponse.json(
      { error: '"name" is required and must be a non-empty string' },
      { status: 400 },
    );
  }

  const user: User = { id: getNextId(), ...fields, name };
  users.push(user);

  return NextResponse.json(user, { status: 201 });
}
