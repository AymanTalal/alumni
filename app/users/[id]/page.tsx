import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import * as UserController from "@/lib/controllers/UserController";
import UserApplicationsView from "@/lib/views/applications/UserApplicationsView";
import PageContainer from "@/lib/views/ui/PageContainer";
import UserDetailView from "@/lib/views/users/UserDetailView";
import { deleteUserAction } from "../actions";

// Route: "/users/:id"  (file: app/users/[id]/page.tsx)
// GET → Page → UserController.getById → Model, rendered by UserDetailView.
// The Delete button runs deleteUserAction (../actions.ts) → UserController.delete.
// Below it, the read-only Applications section: ApplicationController.getAllForUser (applications with
// their job postings), rendered by UserApplicationsView.

export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  // Render on every request, so the page always reflects the current data
  await connection();

  const { id } = await params;
  const result = await UserController.getById(id);

  // Unknown id → 404 status and the "User not found" page in ./not-found.tsx
  if ("error" in result) notFound();

  const applications = await ApplicationController.getAllForUser(result.user.id);
  // The user was deleted between the two reads → same 404 page
  if ("error" in applications) notFound();

  return (
    <PageContainer>
      <UserDetailView user={result.user} deleteAction={deleteUserAction} />
      <UserApplicationsView applications={applications.applications} />
    </PageContainer>
  );
}
