"use client";

import { useActionState } from "react";
import type { ApplicationStatus } from "@/lib/models/application";
import type { ApplicationFormState } from "./ApplicationCreateForm";

// View: a small form to change one application's status (pending, accepted, rejected).
// Markup and styling only, no data logic: submitting it runs the Server Action passed in as
// `action` (bound to this application's id), and shows the error it returns, if any.
// A Client Component only because React's useActionState runs in the browser.

type Props = {
  applicationId: number;
  status: ApplicationStatus;
  statuses: readonly ApplicationStatus[];
  action: (
    applicationId: number,
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
};

export default function ApplicationStatusForm({ applicationId, status, statuses, action }: Props) {
  // bind attaches this application's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, applicationId), {});

  return (
    <form action={formAction} className="inline-flex flex-col">
      <div className="flex items-center gap-2">
        <select
          name="status"
          defaultValue={status}
          aria-label="Status"
          className="rounded border border-gray-300 px-1 py-0.5 text-sm"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          {pending ? "Saving…" : "Update"}
        </button>
      </div>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </form>
  );
}
