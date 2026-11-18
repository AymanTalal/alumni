"use client";

import { useActionState } from "react";
import type { Announcement } from "@/lib/models/announcement";
import { Button, ButtonLink } from "../ui/Button";
import { Field, FormMessage, Input, Textarea } from "../ui/Field";
import type { AnnouncementFormState } from "./AnnouncementCreateForm";

// (No card of its own: the page puts the form in one Panel — DESIGN.md §9.)
// View: the edit form on /announcements/{id}/edit (DESIGN.md, Forms) — the same fields, hints and
// look as the "Post an announcement" form on /announcements/new, pre-filled with the current
// values. Markup and styling only, no data logic: submitting it runs the update Server Action
// passed in as `action`, and the form shows the validation error it returns, keeping what was
// typed; on success the action goes back to the announcement's page.
// A Client Component only because React's useActionState runs in the browser.

type Props = {
  announcement: Announcement;
  action: (
    announcementId: number,
    state: AnnouncementFormState,
    formData: FormData,
  ) => Promise<AnnouncementFormState>;
};

export default function AnnouncementEditForm({ announcement, action }: Props) {
  // bind attaches this announcement's id to the action, as the Next.js forms guide recommends
  const [state, formAction, pending] = useActionState(action.bind(null, announcement.id), {});

  // After an error, show what was typed; otherwise the announcement's current values
  const value = (field: "title" | "content" | "author") =>
    state.values ? state.values[field] : (announcement[field] ?? "");

  return (
    <>
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="Title" required>
          <Input name="title" defaultValue={value("title")} />
        </Field>
        <Field label="Content" required>
          <Textarea name="content" rows={6} defaultValue={value("content")} />
        </Field>
        <Field label="Author" hint="Optional. For example “Alumni Office”.">
          <Input name="author" defaultValue={value("author")} />
        </Field>

        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <ButtonLink href={`/announcements/${announcement.id}`} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
