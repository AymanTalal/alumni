// User Controller for the JSON API side (used by the /api/users routes).
// Each function takes the Request (and the route params where needed), calls the User Model,
// and returns a NextResponse.json() with the right status code.
// It never stores data itself; all data access goes through lib/models/user.ts (PostgreSQL).
// Database errors are turned into a 400 (bad data) or a generic 500 by withDatabaseErrors.

import { NextResponse } from "next/server";
import * as UserModel from "@/lib/models/user";
import type { UserData } from "@/lib/models/user";
import { withDatabaseErrors } from "./databaseErrors";
import { AGE_INVALID, NAME_REQUIRED, notFoundMessage, validateAge, validateName } from "./UserController";

// The second argument Next.js passes to a route handler under app/api/users/[id]/
type IdParams = { params: Promise<{ id: string }> };

const NOT_FORM_DATA = "Request body must be form-data";

// JSON error response with the given status code
function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

// Reads the form-data body into a plain object with every text field sent.
// Uploaded files are skipped, and a client-sent "id" is ignored (the Model assigns ids).
// Returns null if the body isn't form-data (request.formData() throws for JSON or an empty body).
async function readFormFields(request: Request): Promise<Record<string, string> | null> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return null;
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && key !== "id") {
      fields[key] = value;
    }
  }
  return fields;
}

// POST /api/users: creates a user from form-data. "name" is required, "age" (if sent) must be a
// whole number, any other fields are stored as sent. 201 with the new user, or 400 if the body isn't
// form-data, "name" is missing or "age" is invalid.
export const create = withDatabaseErrors(async (request: Request) => {
  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);
  if (validateName(fields, true)) return jsonError(NAME_REQUIRED, 400);
  if (validateAge(fields)) return jsonError(AGE_INVALID, 400);

  const user = await UserModel.createUser(fields as UserData);
  return NextResponse.json(user, { status: 201 });
});

// GET /api/users: returns every user (an empty array if there are none). 200.
export const getAll = withDatabaseErrors(async () => {
  return NextResponse.json(await UserModel.getAllUsers());
});

// GET /api/users/{id}: returns the user (200), or 404.
export const getById = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const user = await UserModel.getUserById(Number(id));
  if (!user) return jsonError(notFoundMessage(id), 404);

  return NextResponse.json(user);
});

// PUT /api/users/{id}: replaces the whole user with the form-data sent, keeping the id.
// 200 with the updated user, 404 if it doesn't exist, 400 if the body isn't form-data,
// "name" is missing or "age" is invalid.
export const replace = withDatabaseErrors(async (request: Request, { params }: IdParams) => {
  const { id } = await params;
  if (!(await UserModel.getUserById(Number(id)))) return jsonError(notFoundMessage(id), 404);

  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);
  if (validateName(fields, true)) return jsonError(NAME_REQUIRED, 400);
  if (validateAge(fields)) return jsonError(AGE_INVALID, 400);

  const user = await UserModel.replaceUser(Number(id), fields as UserData);
  if (!user) return jsonError(notFoundMessage(id), 404);
  return NextResponse.json(user);
});

// PATCH /api/users/{id}: changes only the fields sent and keeps the rest.
// 200 with the updated user, 404 if it doesn't exist, 400 if the body isn't form-data,
// "name" is blank or "age" is invalid.
export const update = withDatabaseErrors(async (request: Request, { params }: IdParams) => {
  const { id } = await params;
  if (!(await UserModel.getUserById(Number(id)))) return jsonError(notFoundMessage(id), 404);

  const fields = await readFormFields(request);
  if (fields === null) return jsonError(NOT_FORM_DATA, 400);
  if (validateName(fields, false)) return jsonError(NAME_REQUIRED, 400);
  if (validateAge(fields)) return jsonError(AGE_INVALID, 400);

  const user = await UserModel.updateUser(Number(id), fields);
  if (!user) return jsonError(notFoundMessage(id), 404);
  return NextResponse.json(user);
});

// DELETE /api/users/{id}: removes the user. 200 with { message, id }, or 404.
const remove = withDatabaseErrors(async (_request: Request, { params }: IdParams) => {
  const { id } = await params;
  const numericId = Number(id);
  if (!(await UserModel.deleteUser(numericId))) return jsonError(notFoundMessage(id), 404);

  return NextResponse.json({ message: "User deleted", id: numericId });
});

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use ApiUserController.delete(request, context).
export { remove as delete };
