// Page-side wording (BRAND.md voice) for the messages the Models and controllers return.
// The Models and the JSON API keep their exact messages (e.g. '"name" is required and must be a
// non-empty string' stays in /api answers); only what the PAGES show is translated, here, by the
// page controllers (UserController, AnnouncementController, JobPostingController,
// ApplicationController) through withPageMessages. Plain English, short, no field names in quotes,
// no ids, no database words. A message that isn't recognised is shown as it is.

// How a field / a record is called on the pages
const FIELDS: Record<string, string> = {
  name: "name",
  title: "title",
  content: "content",
  company: "company",
  author: "author",
  age: "age",
  status: "status",
};
const THINGS: Record<string, string> = {
  User: "graduate or student",
  "Job posting": "job posting",
  Announcement: "announcement",
  Application: "application",
};

// The rules, in order: [pattern, page wording]
const RULES: [RegExp, (...groups: string[]) => string][] = [
  // validation (controllers and Models)
  [/^"userId" is required$/, () => "Choose a graduate or student."],
  [/^"jobPostingId" is required$/, () => "Choose a job posting."],
  [/^"status" must be one of: .*$/, () => "Choose Pending, Accepted or Rejected."],
  [/^"age" must be a whole number \(0 or more\)$/, () => "The age must be a whole number (0 or more)."],
  [/^"(\w+)" is required and must be a non-empty string$/, (field) => `The ${FIELDS[field] ?? field} can't be empty.`],
  [/^"(\w+)" is required$/, (field) => `The ${FIELDS[field] ?? field} can't be empty.`],
  [/^"(\w+)" can't be empty$/, (field) => `The ${FIELDS[field] ?? field} can't be empty.`],
  [/^"(\w+)" must be text$/, (field) => `The ${FIELDS[field] ?? field} must be text.`],
  [/^"(\w+)" can be at most (\d+) characters$/, (field, max) => `The ${FIELDS[field] ?? field} can be at most ${max} characters.`],
  // records that don't exist (any more), invalid ids
  [/^(User|Job posting|Announcement|Application) with id ".*" not found$/, (thing) => `We couldn't find that ${THINGS[thing]}. It may have been deleted.`],
  [/^(User|Job posting|Announcement|Application) id ".*" is not a valid number$/, (thing) => `That link doesn't point to a valid ${THINGS[thing]}.`],
  [/^User already applied to this job posting$/, () => "This person has already applied to this job posting."],
  // values the database rejected (lib/controllers/databaseErrors.ts), with or without a detail
  [/^A record with this value already exists/, () => "That value is already in use. Please choose another one."],
  [/^This record refers to \(or is referred to by\) another record/, () => "This change conflicts with other records. Please check and try again."],
  [/^A value is not allowed by the database rules$/, () => "One of the values isn't allowed. Please check the form."],
  [/^A required value is missing$/, () => "A required field is empty. Please fill it in."],
  [/^A value has the wrong format$/, () => "One of the values has the wrong format. Please check the form."],
  [/^A number is out of range$/, () => "A number is too large. Please check the form."],
];

// One message in the page wording
export function toPageMessage(message: string): string {
  for (const [pattern, wording] of RULES) {
    const match = message.match(pattern);
    if (match) return wording(...match.slice(1));
  }
  return message;
}

// Wraps a page controller function: if its result has an { error } message, the message is put in
// the page wording; everything else is returned unchanged.
export function withPageMessages<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const result = await fn(...args);
    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      return { ...result, error: toPageMessage(result.error) };
    }
    return result;
  };
}
