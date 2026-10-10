"use client";

import { useActionState } from "react";

// View: a small form with a "Delete" button. Markup and styling only, no data logic:
// it asks for confirmation, then runs the delete Server Action passed in as `action`,
// and shows the action's error (e.g. the announcement was already deleted) if there is one.
// A Client Component because the confirmation dialog and useActionState run in the browser.

export type DeleteAnnouncementState = { error?: string };

type Props = {
  announcementId: number;
  title: string;
  action: (
    announcementId: number,
    state: DeleteAnnouncementState,
    formData: FormData,
  ) => Promise<DeleteAnnouncementState>;
};

export default function DeleteAnnouncementButton({ announcementId, title, action }: Props) {
  // bind attaches this announcement's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, announcementId), {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete announcement "${title}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
      className="inline-flex flex-col"
    >
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
