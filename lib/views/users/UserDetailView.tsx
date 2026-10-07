import Link from "next/link";
import type { User } from "@/lib/models/user";
import DeleteUserButton, { type DeleteUserState } from "./DeleteUserButton";

// View: shows one user with all of their fields, plus Edit and Delete buttons and a link
// back to the list. Markup and styling only, no data logic: the page gets the user from
// UserController and passes it in, together with the delete Server Action.

type Props = {
  user: User;
  deleteAction: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
};

export default function UserDetailView({ user, deleteAction }: Props) {
  return (
    <>
      <Link href="/users" className="text-blue-600 hover:underline">
        ← All users
      </Link>

      <h1 className="mt-6 text-3xl font-bold">{user.name}</h1>

      <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {Object.entries(user).map(([field, value]) => (
          <div key={field} className="flex gap-4 py-2">
            <dt className="w-40 font-medium capitalize">{field}</dt>
            <dd className="text-gray-700">{value === "" ? "—" : String(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-start gap-4">
        <Link
          href={`/users/${user.id}/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Edit
        </Link>
        <div className="py-2">
          <DeleteUserButton userId={user.id} userName={user.name} action={deleteAction} />
        </div>
      </div>
    </>
  );
}
