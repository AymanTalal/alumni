"use client";

import { useActionState } from "react";

// View: a small form with a "Remove" button for one application. Markup and styling only, no data
// logic: it asks for confirmation, then runs the delete Server Action passed in as `action`,
// and shows the action's error (e.g. the application was already removed) if there is one.
// A Client Component because the confirmation dialog and useActionState run in the browser.

export type DeleteApplicationState = { error?: string };

type Props = {
  applicationId: number;
  applicantName: string;
  action: (
    applicationId: number,
    state: DeleteApplicationState,
    formData: FormData,
  ) => Promise<DeleteApplicationState>;
};

export default function DeleteApplicationButton({ applicationId, applicantName, action }: Props) {
  // bind attaches this application's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, applicationId), {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remove ${applicantName}'s application? This cannot be undone.`)) {
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
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
