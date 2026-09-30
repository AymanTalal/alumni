import { NextResponse } from "next/server";
import { findUser, readFormFields, users, type User } from "@/lib/users";

// GET    "/api/users/:id" → returns that one user as JSON
// PUT    "/api/users/:id" → replaces the whole user with the form-data sent (id stays the same)
// PATCH  "/api/users/:id" → changes only the fields sent, keeps every other field as it was
// DELETE "/api/users/:id" → removes that user and returns a confirmation
// All return JSON (200), or 404 if no user has that id.

type Context = RouteContext<"/api/users/[id]">;

function notFound(id: string) {
  return NextResponse.json(
    { error: `User with id "${id}" not found` },
    { status: 404 },
  );
}

function notFormData() {
  return NextResponse.json(
    { error: "Request body must be form-data" },
    { status: 400 },
  );
}

function nameRequired() {
  return NextResponse.json(
    { error: '"name" is required and must be a non-empty string' },
    { status: 400 },
  );
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const user = findUser(Number(id));
  if (!user) return notFound(id);

  return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const existing = findUser(Number(id));
  if (!existing) return notFound(id);

  const fields = await readFormFields(request);
  if (fields === null) return notFormData();

  // A replacement is a full user, so it needs a name just like POST
  const { name } = fields;
  if (name === undefined || name.trim() === "") return nameRequired();

  // Build a brand-new object: fields not sent this time are dropped
  const updated: User = { id: existing.id, ...fields, name };
  users[users.indexOf(existing)] = updated;

  return NextResponse.json(updated);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const existing = findUser(Number(id));
  if (!existing) return notFound(id);

  const fields = await readFormFields(request);
  if (fields === null) return notFormData();

  // name is optional here, but if it's sent it can't be blank
  if (fields.name !== undefined && fields.name.trim() === "") return nameRequired();

  // Merge: start from the existing user, overwrite only the fields that were sent
  Object.assign(existing, fields);

  return NextResponse.json(existing);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const existing = findUser(Number(id));
  if (!existing) return notFound(id);

  // splice(index, 1) removes one item from the array in place
  users.splice(users.indexOf(existing), 1);

  return NextResponse.json({ message: "User deleted", id: existing.id });
}
