import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import { ButtonLink } from "@/lib/views/ui/Button";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import UserListView from "@/lib/views/users/UserListView";

// Route: "/users"  (file: app/users/page.tsx)
// GET /users → Page → UserController.getAll → Model, rendered by UserListView (a grid of person
// cards, DESIGN.md §9). New users are added on /users/new; Edit and Delete are on each person's page.
// One primary button per view: "Add a graduate" in the band — or, when the list is empty, the empty
// state's button and nothing in the band.

export const metadata = { title: "Graduates & students" };

export default async function UsersPage() {
  // Render on every request, so newly created users show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { users } = await UserController.getAll();

  return (
    <PageContainer
      band={
        <PageBand
          eyebrow="Directory"
          title="Graduates & students"
          description="Find a graduate, or add one to the directory."
          count={users.length === 1 ? "1 person" : `${users.length} people`}
          actions={
            users.length > 0 ? (
              <ButtonLink href="/users/new" variant="onAction">
                Add a graduate
              </ButtonLink>
            ) : undefined
          }
        />
      }
    >
      <UserListView users={users} />
    </PageContainer>
  );
}
