"use client";

import { useActionState } from "react";
import { Button } from "../ui/Button";
import Card from "../ui/Card";
import { Field, FormMessage, Input } from "../ui/Field";

// View: the "Add a user" form. Markup and styling only, no data logic: submitting it runs the
// Server Action passed in as `action`, and the form shows whatever result that action returns.
// It's a Client Component only because React's useActionState (which carries the action's
// result back to the form) runs in the browser.

// What the action returns, and so what the form can show
export type UserFormState = {
  error?: string; // validation error from UserController, e.g. "name" missing
  message?: string; // success message
  values?: { name?: string; email?: string; age?: string }; // refills the inputs after an error
};

type Props = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
};

export default function UserCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="mb-8">
      <form action={formAction} className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-ink">Add a user</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" required>
            <Input name="name" defaultValue={state.values?.name} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={state.values?.email} />
          </Field>
          <Field label="Age">
            <Input name="age" type="number" min={0} defaultValue={state.values?.age} />
          </Field>
        </div>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.message && <FormMessage tone="success">{state.message}</FormMessage>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Adding…" : "Add user"}
        </Button>
      </form>
    </Card>
  );
}
