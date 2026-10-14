// User Controller for the page (view) side: the /users pages and their Server Actions.
// No Request / NextResponse here: functions take plain arguments, call the User Model,
// and return plain result objects ({ user } or { error }) that a page.tsx can render.
// It never stores data itself; all data access goes through lib/models/user.ts (PostgreSQL).

import * as UserModel from "@/lib/models/user";
import type { PartialUserData, User, UserData } from "@/lib/models/user";
import { clientMessageFor, PAGE_ERROR } from "./databaseErrors";

export type UserResult = { user: User } | { error: string };
export type UsersResult = { users: User[] };
export type DeleteResult = { id: number } | { error: string };

// Error messages shared with ApiUserController, so both sides report the same thing.
export const NAME_REQUIRED = '"name" is required and must be a non-empty string';
export const AGE_INVALID = '"age" must be a whole number (0 or more)';
export const notFoundMessage = (id: number | string) => `User with id "${id}" not found`;

// Validation rule shared with ApiUserController: "name" must be a non-empty string.
// When required is false (partial updates), "name" may be left out, but can't be blank if given.
// Returns an error message, or null if the data is valid.
export function validateName(
  data: { name?: unknown },
  required: boolean,
): string | null {
  const { name } = data;
  if (name === undefined) return required ? NAME_REQUIRED : null;
  if (typeof name !== "string" || name.trim() === "") return NAME_REQUIRED;
  return null;
}

// Validation rule shared with ApiUserController: "age" is optional, but if it's given (and not
// empty) it must be a whole number, because the database column is an integer.
// Returns an error message, or null if the data is valid.
export function validateAge(data: { [field: string]: unknown }): string | null {
  const { age } = data;
  if (age === undefined || age === "") return null;
  if (typeof age === "number") return Number.isInteger(age) && age >= 0 ? null : AGE_INVALID;
  return typeof age === "string" && /^\d+$/.test(age.trim()) ? null : AGE_INVALID;
}

// Turns an id from a URL or form ("3") into a number. Anything else becomes NaN,
// which never matches a user, so it is reported as "not found".
function toId(id: number | string): number {
  return typeof id === "number" ? id : Number(id);
}

// Runs a database call; a database error becomes an { error } result the page can show
// (a clear message if the data caused it, a friendly generic one otherwise).
async function safely<T>(action: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await action();
  } catch (error) {
    return { error: clientMessageFor(error) ?? PAGE_ERROR };
  }
}

// Creates a user. Returns { user } on success,
// or { error } if "name" is missing or blank, "age" isn't a whole number, or saving failed.
export async function create(data: Partial<UserData>): Promise<UserResult> {
  const error = validateName(data, true) ?? validateAge(data);
  if (error) return { error };

  return safely(async () => ({ user: await UserModel.createUser(data as UserData) }));
}

// Returns every user. (A database error here is shown by Next.js's error page.)
export async function getAll(): Promise<UsersResult> {
  return { users: await UserModel.getAllUsers() };
}

// Returns { user } for this id, or { error } if there is none.
export async function getById(id: number | string): Promise<UserResult> {
  const user = await UserModel.getUserById(toId(id));
  return user ? { user } : { error: notFoundMessage(id) };
}

// Changes only the given fields. Returns { user } on success, or { error } if the user doesn't
// exist, "name" is given but blank, "age" isn't a whole number, or saving failed.
export async function update(id: number | string, partialData: PartialUserData): Promise<UserResult> {
  const error = validateName(partialData, false) ?? validateAge(partialData);
  if (error) return { error };

  return safely(async () => {
    const user = await UserModel.updateUser(toId(id), partialData);
    return user ? { user } : { error: notFoundMessage(id) };
  });
}

// Deletes the user. Returns { id } on success, or { error } if there is none or deleting failed.
async function remove(id: number | string): Promise<DeleteResult> {
  const numericId = toId(id);
  return safely(async () =>
    (await UserModel.deleteUser(numericId)) ? { id: numericId } : { error: notFoundMessage(id) },
  );
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use UserController.delete(id).
export { remove as delete };
