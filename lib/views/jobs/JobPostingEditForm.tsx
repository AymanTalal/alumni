"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { JobPosting } from "@/lib/models/jobPosting";
import type { JobPostingFormState } from "./JobPostingCreateForm";

// View: the "Edit job posting" form. Same fields as the create form, pre-filled with the
// posting's current values. Markup and styling only, no data logic: submitting it runs the
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
        <span className="font-medium">Company</span>
        <input
          name="company"
          defaultValue={value("company")}
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
        <Link href={`/jobs/${jobPosting.id}`} className="text-blue-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
