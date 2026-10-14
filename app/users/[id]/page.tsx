import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import UserDetailView from "@/lib/views/users/UserDetailView";
import { deleteUserAction } from "../actions";

// Route: "/users/:id"  (file: app/users/[id]/page.tsx)
// GET → Page → UserController.getById → Model, rendered by UserDetailView.
// The Delete button runs deleteUserAction (../actions.ts) → UserController.delete.

export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  // Render on every request, so the page always reflects the current data
  await connection();

  const { id } = await params;
  const result = await UserController.getById(id);

  // Unknown id → 404 status and the "User not found" page in ./not-found.tsx
  if ("error" in result) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <UserDetailView user={result.user} deleteAction={deleteUserAction} />
    </main>
  );
}
