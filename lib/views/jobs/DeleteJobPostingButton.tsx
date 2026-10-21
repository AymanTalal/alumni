"use client";

import { useActionState } from "react";

// View: a small form with a "Delete" button. Markup and styling only, no data logic:
// it asks for confirmation, then runs the delete Server Action passed in as `action`,
// and shows the action's error (e.g. the job posting was already deleted) if there is one.
// A Client Component because the confirmation dialog and useActionState run in the browser.

export type DeleteJobPostingState = { error?: string };

type Props = {
  jobPostingId: number;
  title: string;
  action: (
    jobPostingId: number,
    state: DeleteJobPostingState,
    formData: FormData,
  ) => Promise<DeleteJobPostingState>;
};

export default function DeleteJobPostingButton({ jobPostingId, title, action }: Props) {
  // bind attaches this job posting's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, jobPostingId), {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete job posting "${title}"? Its applications are deleted too. This cannot be undone.`,
          )
        ) {
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
