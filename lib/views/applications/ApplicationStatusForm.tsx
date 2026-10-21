"use client";

import { useActionState } from "react";
import type { ApplicationStatus } from "@/lib/models/application";
import { Button } from "../ui/Button";
import { Select } from "../ui/Field";
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
        <Select name="status" defaultValue={status} aria-label="Status" className="w-auto py-1 text-sm">
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Update"}
        </Button>
      </div>
      {state.error && <span className="mt-1 text-sm text-danger">{state.error}</span>}
    </form>
  );
}
