"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as UserController from "@/lib/controllers/UserController";
import type { DeleteUserState } from "@/lib/views/users/DeleteUserButton";
import type { UserFormState } from "@/lib/views/users/UserCreateForm";

// Server Actions for the user pages: create, update and delete.
// When one of the forms is submitted, the browser sends a POST to the page it's on
// and Next.js runs the matching function here on the server.
// No data logic in this file: each action reads the form, calls UserController
// (which validates and calls the User Model), and returns the result or redirects.

// Create: empty optional fields are left out, like when they aren't sent to the API.
function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function createUserAction(
  _previousState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const values = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    age: field(formData, "age"),
  };

  const result = await UserController.create(values);

  // Validation failed (e.g. "name" missing): show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh /users so the new user appears in the list
  revalidatePath("/users");
  return { message: `User "${result.user.name}" created with id ${result.user.id}.` };
}

// Reads one text field as typed ("" if it was left empty).
function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Update (the "Edit user" form on /users/{id}/edit). userId is bound by the form.
// Changes name, email and age and keeps every other field. A field cleared in the form is saved
// as "" (like sending it empty to PATCH /api/users/{id}).
export async function updateUserAction(
  userId: number,
  _previousState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    age: text(formData, "age"),
  };

  const result = await UserController.update(userId, values);

  // Validation failed or the user no longer exists: show the error and keep what was typed
  if ("error" in result) {
    return { error: result.error, values };
  }

  // Success: refresh the pages that show this user, then go to the user's page
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  redirect(`/users/${userId}`);
}

// Delete (the "Delete" buttons on /users and /users/{id}). userId is bound by the button.
// (The form also passes the previous state and the form data, but delete doesn't need them.)
export async function deleteUserAction(userId: number): Promise<DeleteUserState> {
  const result = await UserController.delete(userId);

  // The user doesn't exist (e.g. already deleted elsewhere): show a message next to the button
  if ("error" in result) {
    return { error: result.error };
  }

  // Success: refresh the list and go to it
  revalidatePath("/users");
  redirect("/users");
}
