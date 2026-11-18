"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "../ui/Button";
import { Field, FormMessage, Input, Textarea } from "../ui/Field";

// (No card of its own: the page puts the form in one Panel — DESIGN.md §9.)
// View: the "Post an announcement" form on /announcements/new (DESIGN.md, Forms). Markup and
// styling only, no data logic: submitting it runs the Server Action passed in as `action`
// (createAnnouncementAction), and the form shows the validation error that action returns,
// keeping what was typed. On success the action goes to the new announcement's page.
// It's a Client Component only because React's useActionState (which carries the action's result
// back to the form) runs in the browser.

// What the actions return, and so what the create and edit forms can show
export type AnnouncementFormState = {
  error?: string; // validation error from AnnouncementController, e.g. "title" missing
  message?: string; // success message (the forms redirect on success, so it's rarely shown)
  values?: { title?: string; content?: string; author?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: AnnouncementFormState, formData: FormData) => Promise<AnnouncementFormState>;
};

export default function AnnouncementCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Title" required>
          <Input name="title" defaultValue={state.values?.title} />
        </Field>
        <Field label="Content" required>
          <Textarea name="content" rows={6} defaultValue={state.values?.content} />
        </Field>
        <Field label="Author" hint="Optional. For example “Alumni Office”.">
          <Input name="author" defaultValue={state.values?.author} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.message && <FormMessage tone="success">{state.message}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Posting…" : "Post announcement"}
          </Button>
          <ButtonLink href="/announcements" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
