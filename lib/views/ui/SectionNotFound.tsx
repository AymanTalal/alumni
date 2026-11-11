"use client";

import { usePathname } from "next/navigation";
import NotFoundView from "./NotFoundView";

// Shared UI: the not-found page of a section's [id] pages (/jobs/{id}, /jobs/{id}/edit, …), in the
// one shared look (NotFoundView). The page calls notFound() (HTTP 404) both when the id is not a
// valid id ("abc", "0", "1.5") and when no row has it; this view tells the two apart from the URL:
//   /jobs/abc    → "Page not found" — Invalid id: "abc" is not a valid job posting id.
//   /jobs/99999  → the section's own title and text, e.g. "Job posting not found"
// A Client Component only because a not-found page gets no props and reads the path with
// usePathname. Markup and wording only: the rules for ids stay in the models.

type Props = {
  title: string; // e.g. "Job posting not found"
  reason: string; // e.g. "There is no job posting with this id."
  resource: string; // e.g. "job posting", for the invalid-id reason
  back: { href: string; label: string };
};

// An id a row could have: a whole number greater than 0 (like the models' own check)
const isValidId = (id: string) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;

export default function SectionNotFound({ title, reason, resource, back }: Props) {
  const id = decodeURIComponent(usePathname().split("/")[2] ?? "");
  if (!isValidId(id)) {
    return (
      <NotFoundView
        title="Page not found"
        reason={`Invalid id: “${id}” is not a valid ${resource} id.`}
        back={back}
      />
    );
  }
  return <NotFoundView title={title} reason={reason} back={back} />;
}
