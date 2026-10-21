"use client";

import { useActionState } from "react";
import type { User } from "@/lib/models/user";

// View: the "Add application" form on a job posting's page: choose a user, then submit.
// Markup and styling only, no data logic: submitting it runs the Server Action passed in as
// `action` (bound to this posting's id), and the form shows the result it returns, e.g.
// "User already applied to this job posting".
// A Client Component only because React's useActionState runs in the browser.

// What the application actions return, and so what the application forms can show
export type ApplicationFormState = {
  error?: string; // problem reported by the Application Model, e.g. already applied
  message?: string; // success message
};

type Props = {
  jobPostingId: number;
  users: User[];
  action: (
    jobPostingId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
};

export default function ApplicationCreateForm({ jobPostingId, users, action }: Props) {
  // bind attaches this job posting's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, jobPostingId), {});

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <h3 className="text-lg font-semibold">Add application</h3>

      <label className="flex flex-col gap-1">
        <span className="font-medium">User *</span>
        <select name="userId" defaultValue="" className="rounded border border-gray-300 px-2 py-1">
          <option value="" disabled>
            Choose a user…
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
              {user.email ? ` (${user.email})` : ""}
            </option>
          ))}
        </select>
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.message && <p className="text-green-700">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add application"}
      </button>
    </form>
  );
}
