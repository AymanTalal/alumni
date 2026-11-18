"use client";

import { useActionState } from "react";
import type { JobPosting } from "@/lib/models/jobPosting";
import { Button, ButtonLink } from "../ui/Button";
import { Field, FormMessage, Input } from "../ui/Field";
import type { JobPostingFormState } from "./JobPostingCreateForm";

// (No card of its own: the page puts the form in one Panel — DESIGN.md §9.)
// View: the "Edit job posting" form (DESIGN.md, Forms) — the same fields, hints and look as the
// "Post a job" form on /jobs/new, pre-filled with the posting's current values. Markup and styling only, no data logic: submitting it runs the
// update Server Action passed in as `action`, and the form shows the validation error it returns.
// A Client Component only because React's useActionState runs in the browser.

type Props = {
  jobPosting: JobPosting;
  action: (
    jobPostingId: number,
    state: JobPostingFormState,
    formData: FormData,
  ) => Promise<JobPostingFormState>;
};

export default function JobPostingEditForm({ jobPosting, action }: Props) {
  // bind attaches this job posting's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, jobPosting.id), {});

  // After an error, show what was typed; otherwise the posting's current values
  const value = (field: "title" | "company") =>
    state.values ? state.values[field] : (jobPosting[field] ?? "");

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Title" required hint="For example “Junior Data Analyst”. At most 200 characters.">
          <Input name="title" defaultValue={value("title")} />
        </Field>

        <Field label="Company" hint="Optional. Leave it empty to remove the company.">
          <Input name="company" defaultValue={value("company")} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <ButtonLink href={`/jobs/${jobPosting.id}`} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
