import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as ApplicationController from "@/lib/controllers/ApplicationController";
import * as UserController from "@/lib/controllers/UserController";
import UserApplicationsView from "@/lib/views/applications/UserApplicationsView";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import UserDetailView from "@/lib/views/users/UserDetailView";
import { deleteUserAction } from "../actions";

// Route: "/users/:id"  (file: app/users/[id]/page.tsx)
// GET → Page → UserController.getById → Model: the page band, then UserDetailView (the profile
// header card over the band, DESIGN.md §9). The Delete button runs deleteUserAction (../actions.ts) → UserController.delete.
// Below it, the read-only Applications section: ApplicationController.getAllForUser (applications with
// their job postings), rendered by UserApplicationsView.

// The browser tab shows the user's name ("Ayşe Yılmaz · IU Alumni")
export async function generateMetadata({ params }: PageProps<"/users/[id]">): Promise<Metadata> {
  const result = await UserController.getById((await params).id);
  return "error" in result ? {} : { title: result.user.name };
}

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
    <PageContainer
      overlap
      band={<PageBand overlap back={{ href: "/users", label: "All graduates & students" }} eyebrow="Graduate profile" />}
    >
      <UserDetailView user={result.user} deleteAction={deleteUserAction} />
      <UserApplicationsView userName={result.user.name} applications={applications.applications} />
    </PageContainer>
  );
}
