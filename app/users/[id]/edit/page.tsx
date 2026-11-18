import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import { UserIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import UserEditForm from "@/lib/views/users/UserEditForm";
import { updateUserAction } from "../../actions";

// Route: "/users/:id/edit"  (file: app/users/[id]/edit/page.tsx)
// GET → Page → UserController.getById → Model, rendered by UserEditForm (the same form look as
// /users/new). Submitting the form runs updateUserAction (../../actions.ts) → UserController.update,
// which shows the validation error in the form or goes back to /users/{id}.

// The browser tab shows "Edit Ayşe Yılmaz · IU Alumni"
export async function generateMetadata({ params }: PageProps<"/users/[id]/edit">): Promise<Metadata> {
  const result = await UserController.getById((await params).id);
  return "error" in result ? {} : { title: `Edit ${result.user.name}` };
}

export default async function EditUserPage({ params }: PageProps<"/users/[id]/edit">) {
  // Render on every request, so the form is pre-filled with the current data
  await connection();

  const { id } = await params;
  const result = await UserController.getById(id);

  // Unknown id → 404 status and the "User not found" page in ../not-found.tsx
  if ("error" in result) notFound();

  return (
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: `/users/${result.user.id}`, label: `Back to ${result.user.name}` }}
          title={`Edit ${result.user.name}`}
          description="Change their name, email or age."
        />
      }
    >
      <Panel title="Graduate details" icon={<UserIcon />}>
        <UserEditForm user={result.user} action={updateUserAction} />
      </Panel>
    </PageContainer>
  );
}
