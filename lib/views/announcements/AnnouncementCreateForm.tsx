"use client";

import { useActionState } from "react";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { Field, FormMessage, Input, Textarea } from "../ui/Field";

// View: the "Add an announcement" form. Markup and styling only, no data logic: submitting it
// runs the Server Action passed in as `action`, and the form shows whatever result that action
// returns. It's a Client Component only because React's useActionState (which carries the
// action's result back to the form) runs in the browser.

// What the actions return, and so what the create and edit forms can show
export type AnnouncementFormState = {
  error?: string; // validation error from AnnouncementController, e.g. "title" missing
  message?: string; // success message
  values?: { title?: string; content?: string; author?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: AnnouncementFormState, formData: FormData) => Promise<AnnouncementFormState>;
};

export default function AnnouncementCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="mb-8">
      <form action={formAction} className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-ink">Add an announcement</h2>

        <Field label="Title" required>
          <Input name="title" defaultValue={state.values?.title} />
        </Field>

        <Field label="Content" required>
          <Textarea name="content" rows={4} defaultValue={state.values?.content} />
        </Field>

        <Field label="Author">
          <Input name="author" defaultValue={state.values?.author} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.message && <FormMessage tone="success">{state.message}</FormMessage>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Adding…" : "Add announcement"}
        </Button>
      </form>
    </Card>
  );
}
