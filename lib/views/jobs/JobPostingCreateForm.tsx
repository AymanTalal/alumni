"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "../ui/Button";
import Card from "../ui/Card";
import { Field, FormMessage, Input } from "../ui/Field";

// View: the "New job posting" form on /jobs/new. Markup and styling only, no data logic:
// submitting it runs the Server Action passed in as `action`, and the form shows the validation
// error that action returns (on success the action goes to the new posting's page).
// It's a Client Component only because React's useActionState (which carries the action's result
// back to the form) runs in the browser.

// What the actions return, and so what the create and edit forms can show
export type JobPostingFormState = {
  error?: string; // validation error from the JobPosting Model, e.g. "title" can't be empty
  values?: { title?: string; company?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: JobPostingFormState, formData: FormData) => Promise<JobPostingFormState>;
};

export default function JobPostingCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Title" required hint="For example “Junior Data Analyst”. At most 200 characters.">
          <Input name="title" defaultValue={state.values?.title} />
        </Field>

        <Field label="Company" hint="Optional.">
          <Input name="company" defaultValue={state.values?.company} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add job posting"}
          </Button>
          <ButtonLink href="/jobs" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </Card>
  );
}
