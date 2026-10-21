"use client";

import { useActionState } from "react";
import type { User } from "@/lib/models/user";
import { Button, ButtonLink } from "../ui/Button";
import Card from "../ui/Card";
import { Field, FormMessage, Input } from "../ui/Field";
import type { UserFormState } from "./UserCreateForm";

// View: the "Edit user" form. Same fields as the create form, pre-filled with the user's
// current values. Markup and styling only, no data logic: submitting it runs the update
// Server Action passed in as `action`, and the form shows the validation error it returns.
// A Client Component only because React's useActionState runs in the browser.

type Props = {
  user: User;
  action: (userId: number, state: UserFormState, formData: FormData) => Promise<UserFormState>;
};

export default function UserEditForm({ user, action }: Props) {
  // bind attaches this user's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, user.id), {});

  // After an error, show what was typed; otherwise the user's current values
  const value = (field: "name" | "email" | "age") =>
    state.values ? state.values[field] : (user[field]?.toString() ?? "");

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Name" required>
          <Input name="name" defaultValue={value("name")} />
        </Field>

        <Field label="Email">
          <Input name="email" type="email" defaultValue={value("email")} />
        </Field>

        <Field label="Age">
          <Input name="age" type="number" min={0} defaultValue={value("age")} />
        </Field>

        <p className="text-sm text-muted">Other fields (department, …) are kept as they are.</p>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <ButtonLink href={`/users/${user.id}`} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </Card>
  );
}
