"use client";

import { useActionState } from "react";

// View: the "Add a user" form. Markup and styling only, no data logic: submitting it runs the
// Server Action passed in as `action`, and the form shows whatever result that action returns.
// It's a Client Component only because React's useActionState (which carries the action's
// result back to the form) runs in the browser.

// What the action returns, and so what the form can show
export type UserFormState = {
  error?: string; // validation error from UserController, e.g. "name" missing
  message?: string; // success message
  values?: { name?: string; email?: string; age?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
};

export default function UserCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <h2 className="text-xl font-semibold">Add a user</h2>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Name *</span>
        <input
          name="name"
          defaultValue={state.values?.name}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={state.values?.email}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Age</span>
        <input
          name="age"
          type="number"
          min={0}
          defaultValue={state.values?.age}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.message && <p className="text-green-700">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add user"}
      </button>
    </form>
  );
}
