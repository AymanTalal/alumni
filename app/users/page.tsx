import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import UserCreateForm from "@/lib/views/users/UserCreateForm";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";
import UserListView from "@/lib/views/users/UserListView";
import { createUserAction, deleteUserAction } from "./actions";

// Route: "/users"  (file: app/users/page.tsx)
// GET /users  → Page → UserController.getAll → Model, rendered by UserListView
// POST /users → Server Actions in ./actions.ts: the "Add a user" form → UserController.create,
//               each row's Delete button → UserController.delete

export default async function UsersPage() {
  // Render on every request, so newly created users show up
  // (otherwise Next.js could render this page once at build time, when the list is empty)
  await connection();

  const { users } = await UserController.getAll();

  return (
    <PageContainer>
      <PageHeader title="Users" description={`${users.length} user(s)`} />

      <UserCreateForm action={createUserAction} />
      <UserListView users={users} deleteAction={deleteUserAction} />
    </PageContainer>
  );
}
