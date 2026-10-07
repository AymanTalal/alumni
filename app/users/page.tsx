import { connection } from "next/server";
import * as UserController from "@/lib/controllers/UserController";
import UserCreateForm from "@/lib/views/users/UserCreateForm";
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

  const { users } = UserController.getAll();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="mt-1 text-gray-600">{users.length} user(s)</p>

      <UserCreateForm action={createUserAction} />
      <UserListView users={users} deleteAction={deleteUserAction} />
    </main>
  );
}
