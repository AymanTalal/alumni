"use client";

import { usePathname } from "next/navigation";
import NotFoundView from "./NotFoundView";

// Shared UI: the not-found page of a section's [id] pages (/jobs/{id}, /jobs/{id}/edit, …), in the
// one shared look (NotFoundView). The page calls notFound() (HTTP 404) both when the id is not a
// valid id ("abc", "0", "1.5") and when no row has it; this view tells the two apart from the URL:
//   /jobs/abc    → "We couldn't find that page." — "abc" isn't a job posting number, so this link
//                  can't be right.
//   /jobs/99999  → the section's own title and text, e.g. "We couldn't find that job posting."
// A Client Component only because a not-found page gets no props and reads the path with
// usePathname. Markup and wording only (BRAND.md voice): the rules for ids stay in the models.

type Props = {
  title: string; // e.g. "We couldn't find that job posting."
  reason: string; // e.g. "It may have been deleted, or the link may be wrong."
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
        title="We couldn't find that page."
        reason={`“${id}” isn't a ${resource} number, so this link can't be right.`}
        back={back}
      />
    );
  }
  return <NotFoundView title={title} reason={reason} back={back} />;
}
