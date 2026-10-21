"use client";

import { useActionState } from "react";
import { Button } from "../ui/Button";

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
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "Removing…" : "Remove"}
      </Button>
      {state.error && <span className="mt-1 text-sm text-danger">{state.error}</span>}
    </form>
  );
}
