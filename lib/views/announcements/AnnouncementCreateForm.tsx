"use client";

import { useActionState } from "react";

// View: the "Add an announcement" form. Markup and styling only, no data logic: submitting it
// runs the Server Action passed in as `action`, and the form shows whatever result that action
// returns. It's a Client Component only because React's useActionState (which carries the
// action's result back to the form) runs in the browser.

// What the actions return, and so what the create and edit forms can show
export type AnnouncementFormState = {
  error?: string; // validation error from AnnouncementController, e.g. "title" missing
  message?: string; // success message
  values?: { title?: string; content?: string; author?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: AnnouncementFormState, formData: FormData) => Promise<AnnouncementFormState>;
};

export default function AnnouncementCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <h2 className="text-xl font-semibold">Add an announcement</h2>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Title *</span>
        <input
          name="title"
          defaultValue={state.values?.title}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Content *</span>
        <textarea
          name="content"
          rows={4}
          defaultValue={state.values?.content}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Author</span>
        <input
          name="author"
          defaultValue={state.values?.author}
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
        {pending ? "Adding…" : "Add announcement"}
      </button>
    </form>
  );
}
