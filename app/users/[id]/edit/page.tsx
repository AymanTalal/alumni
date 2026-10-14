import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import UserEditForm from "@/lib/views/users/UserEditForm";
import { updateUserAction } from "../../actions";

// Route: "/users/:id/edit"  (file: app/users/[id]/edit/page.tsx)
// GET → Page → UserController.getById → Model, rendered by UserEditForm.
// Submitting the form runs updateUserAction (../../actions.ts) → UserController.update.

export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await UserController.getById(id);

  // Unknown id → 404 status and the "User not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Edit {result.user.name}</h1>
      <UserEditForm user={result.user} action={updateUserAction} />
    </main>
  );
}
