"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { User } from "@/lib/models/user";
import type { UserFormState } from "./UserCreateForm";

// View: the "Edit user" form. Same fields as the create form, pre-filled with the user's
// current values. Markup and styling only, no data logic: submitting it runs the update
// Server Action passed in as `action`, and the form shows the validation error it returns.
// A Client Component only because React's useActionState runs in the browser.

type Props = {
  user: User;
  action: (userId: number, state: UserFormState, formData: FormData) => Promise<UserFormState>;
};

export default function UserEditForm({ user, action }: Props) {
  // bind attaches this user's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, user.id), {});

  // After an error, show what was typed; otherwise the user's current values
  const value = (field: "name" | "email" | "age") =>
    state.values ? state.values[field] : (user[field]?.toString() ?? "");

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Name *</span>
        <input
          name="name"
          defaultValue={value("name")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={value("email")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Age</span>
        <input
          name="age"
          type="number"
          min={0}
          defaultValue={value("age")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <p className="text-sm text-gray-600">Other fields (department, …) are kept as they are.</p>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
