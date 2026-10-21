"use client";

import { useActionState } from "react";
import type { User } from "@/lib/models/user";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { Field, FormMessage, Select } from "../ui/Field";

// View: the "Add application" form on a job posting's page: choose a user, then submit.
// Markup and styling only, no data logic: submitting it runs the Server Action passed in as
// `action` (bound to this posting's id), and the form shows the result it returns, e.g.
// "User already applied to this job posting".
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
    <Card className="mt-4">
      <form action={formAction} className="flex flex-col gap-4">
        <h3 className="font-semibold text-ink">Add application</h3>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="User" required>
              <Select name="userId" defaultValue="">
                <option value="" disabled>
                  Choose a user…
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
    </Card>
  );
}
