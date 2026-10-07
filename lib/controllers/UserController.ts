// User Controller for the page (view) side, e.g. a future users list or profile page.
// No Request / NextResponse here: functions take plain arguments, call the User Model,
// and return plain result objects ({ user } or { error }) that a page.tsx can render.
// It never stores data itself; all data access goes through lib/models/user.ts.

import * as UserModel from "@/lib/models/user";
import type { PartialUserData, User, UserData } from "@/lib/models/user";

export type UserResult = { user: User } | { error: string };
export type UsersResult = { users: User[] };
export type DeleteResult = { id: number } | { error: string };

// Error messages shared with ApiUserController, so both sides report the same thing.
export const NAME_REQUIRED = '"name" is required and must be a non-empty string';
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

// Turns an id from a URL or form ("3") into a number. Anything else becomes NaN,
// which never matches a user, so it is reported as "not found".
function toId(id: number | string): number {
  return typeof id === "number" ? id : Number(id);
}

// Creates a user. Returns { user } on success, or { error } if "name" is missing or blank.
export function create(data: Partial<UserData>): UserResult {
  const error = validateName(data, true);
  if (error) return { error };

  return { user: UserModel.createUser(data as UserData) };
}

// Returns every user.
export function getAll(): UsersResult {
  return { users: UserModel.getAllUsers() };
}

// Returns { user } for this id, or { error } if there is none.
export function getById(id: number | string): UserResult {
  const user = UserModel.getUserById(toId(id));
  return user ? { user } : { error: notFoundMessage(id) };
}

// Changes only the given fields. Returns { user } on success,
// or { error } if the user doesn't exist or "name" is given but blank.
export function update(id: number | string, partialData: PartialUserData): UserResult {
  const error = validateName(partialData, false);
  if (error) return { error };

  const user = UserModel.updateUser(toId(id), partialData);
  return user ? { user } : { error: notFoundMessage(id) };
}

// Deletes the user. Returns { id } on success, or { error } if there is none.
function remove(id: number | string): DeleteResult {
  const numericId = toId(id);
  return UserModel.deleteUser(numericId)
    ? { id: numericId }
    : { error: notFoundMessage(id) };
}

// "delete" is a reserved word, so the function is named remove and exported as delete:
// callers use UserController.delete(id).
export { remove as delete };
