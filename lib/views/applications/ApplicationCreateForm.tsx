"use client";

import { useActionState } from "react";
import type { User } from "@/lib/models/user";
import { Button } from "../ui/Button";
import { Field, FormMessage, Select } from "../ui/Field";

// View: the "Add application" form on a job posting's page: choose a graduate or student, then
// submit. Its button is the page's ONE primary button (DESIGN.md). Markup and styling only, no
// data logic: submitting it runs the Server Action passed in as `action` (bound to this posting's
// id), and the form shows the result it returns, e.g. "User already applied to this job posting".
// It has no card of its own: JobApplicationsView puts it in a card under the table, or inside the
// empty state when nobody has applied yet.
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
    <form action={formAction} className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Field label="Applicant" required>
            <Select name="userId" defaultValue="">
              <option value="" disabled>
                Choose a graduate or student…
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                  {user.email ? ` (${user.email})` : ""}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add application"}
        </Button>
      </div>

      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.message && <FormMessage tone="success">{state.message}</FormMessage>}
    </form>
  );
}
