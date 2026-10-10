"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Announcement } from "@/lib/models/announcement";
import type { AnnouncementFormState } from "./AnnouncementCreateForm";

// View: the "Edit announcement" form. Same fields as the create form, pre-filled with the
// announcement's current values. Markup and styling only, no data logic: submitting it runs the
// update Server Action passed in as `action`, and the form shows the validation error it returns.
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
    <form action={formAction} className="mt-6 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Title *</span>
        <input
          name="title"
          defaultValue={value("title")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Content *</span>
        <textarea
          name="content"
          rows={6}
          defaultValue={value("content")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Author</span>
        <input
          name="author"
          defaultValue={value("author")}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/announcements/${announcement.id}`} className="text-blue-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
