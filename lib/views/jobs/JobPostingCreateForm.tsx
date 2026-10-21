"use client";

import Link from "next/link";
import { useActionState } from "react";

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
    <form action={formAction} className="mt-6 flex flex-col gap-3 rounded border border-gray-300 p-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Title *</span>
        <input
          name="title"
          defaultValue={state.values?.title}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Company</span>
        <input
          name="company"
          defaultValue={state.values?.company}
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
          {pending ? "Adding…" : "Add job posting"}
        </button>
        <Link href="/jobs" className="text-blue-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
