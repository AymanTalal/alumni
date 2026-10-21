"use client";

import { useActionState } from "react";
import { Button } from "../ui/Button";

// View: a small form with a "Delete" button. Markup and styling only, no data logic:
// it asks for confirmation, then runs the delete Server Action passed in as `action`,
// and shows the action's error (e.g. the user was already deleted) if there is one.
// A Client Component because the confirmation dialog and useActionState run in the browser.

export type DeleteUserState = { error?: string };

type Props = {
  userId: number;
  userName: string;
  action: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
  size?: "md" | "sm";
};

export default function DeleteUserButton({ userId, userName, action, size = "sm" }: Props) {
  // bind attaches this user's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, userId), {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
      className="inline-flex flex-col"
    >
      <Button type="submit" variant="danger" size={size} disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
      {state.error && <span className="mt-1 text-sm text-danger">{state.error}</span>}
    </form>
  );
}
