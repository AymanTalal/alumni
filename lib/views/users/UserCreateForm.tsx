"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "../ui/Button";
import { Field, FormMessage, Input } from "../ui/Field";

// (No card of its own: the page puts the form in one Panel — DESIGN.md §9.)
// View: the "Add a graduate" form on /users/new (DESIGN.md, Forms). Markup and styling only, no
// data logic: submitting it runs the Server Action passed in as `action` (createUserAction), and
// the form shows the validation error that action returns, keeping what was typed. On success the
// action goes to the new user's page.
// It's a Client Component only because React's useActionState (which carries the action's result
// back to the form) runs in the browser.

// What the actions return, and so what the create and edit forms can show
export type UserFormState = {
  error?: string; // validation error from UserController, e.g. "name" missing
  message?: string; // success message (the forms redirect on success, so it's rarely shown)
  values?: { name?: string; email?: string; age?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
};

export default function UserCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Name" required>
          <Input name="name" defaultValue={state.values?.name} autoComplete="name" />
        </Field>
        <Field label="Email" hint="Optional.">
          <Input name="email" type="email" defaultValue={state.values?.email} autoComplete="email" />
        </Field>
        <Field label="Age" hint="Optional. A whole number.">
          <Input name="age" type="number" min={0} defaultValue={state.values?.age} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.message && <FormMessage tone="success">{state.message}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add graduate"}
          </Button>
          <ButtonLink href="/users" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
