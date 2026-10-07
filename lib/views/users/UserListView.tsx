import Link from "next/link";
import type { User } from "@/lib/models/user";
import DeleteUserButton, { type DeleteUserState } from "./DeleteUserButton";

// View: renders a list of users as a table, with View / Edit / Delete for each row.
// Markup and styling only, no data logic: the page gets the users from UserController
// and passes them in, together with the delete Server Action.

// Fields shown in the table; any other fields are visible on the user's own page
const COLUMNS = ["email", "department", "age"] as const;

type Props = {
  users: User[];
  deleteAction: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
};

export default function UserListView({ users, deleteAction }: Props) {
  if (users.length === 0) {
    return (
      <p className="mt-6 text-gray-600">
        No users yet. Add one with the form above, or with <code>POST /api/users</code>.
      </p>
    );
  }

  return (
    <table className="mt-6 w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="py-2 pr-4">ID</th>
          <th className="py-2 pr-4">Name</th>
          {COLUMNS.map((column) => (
            <th key={column} className="py-2 pr-4 capitalize">
              {column}
            </th>
          ))}
          <th className="py-2 pr-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-gray-200 align-top">
            <td className="py-2 pr-4">{user.id}</td>
            <td className="py-2 pr-4">{user.name}</td>
            {COLUMNS.map((column) => (
              <td key={column} className="py-2 pr-4">
                {user[column] || "—"}
              </td>
            ))}
            <td className="py-2 pr-4">
              <div className="flex gap-3">
                <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
                <Link href={`/users/${user.id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <DeleteUserButton userId={user.id} userName={user.name} action={deleteAction} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
