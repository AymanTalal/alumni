// 404 guard middleware: checks that the resource in the URL exists BEFORE the controller runs.
//
//   withExists("jobPosting") on /api/jobs/[id]:
//     /api/jobs/7      and posting 7 exists   → calls the next step (the route handler, then the controller)
//     /api/jobs/99999  and there is no 99999  → answers 404 { "error": "not found",
//                                               "reason": "No job posting with id 99999" } and STOPS:
//                                               the controller is never reached (short-circuit)
//
// It asks the MODEL (the existing get-by-id functions), never the database directly, so the rules
// stay in the models. It only looks up ids that are whole numbers greater than 0; for anything else
// ("abc", "0", …) it steps aside and the controller answers exactly as before (e.g. today's 400, or
// the users' 404). If the lookup itself fails (e.g. the database is down), the error is NOT caught
// here: it goes on to the error handler, which comes before the guard in the line (503 or 500).
// Used through the middleware line in lib/middleware/index.ts.

import { notFound } from "@/lib/http/notFound";
import { getAnnouncementById } from "@/lib/models/announcement";
import { getApplicationById } from "@/lib/models/application";
import { getJobPostingById } from "@/lib/models/jobPosting";
import { getUserById } from "@/lib/models/user";
import type { Middleware, RouteHandler } from "./chain";

export type Resource = "user" | "jobPosting" | "application" | "announcement";

// How each resource is named in the 404 reason ("No job posting with id 99999")
const LABELS: Record<Resource, string> = {
  user: "user",
  jobPosting: "job posting",
  application: "application",
  announcement: "announcement",
};

// Does the row exist? Each resource's own Model function answers.
async function exists(resource: Resource, id: number): Promise<boolean> {
  switch (resource) {
    case "user":
      return (await getUserById(id)) !== undefined;
    case "announcement":
      return (await getAnnouncementById(id)) !== undefined;
    case "jobPosting": {
      const result = await getJobPostingById(id);
      return !("error" in result && result.error === "not-found");
    }
    case "application": {
      const result = await getApplicationById(id);
      return !("error" in result && result.error === "not-found");
    }
  }
}

// Only ids that can match a row are looked up: a whole number greater than 0 (and not too large)
function isLookupId(id: string): boolean {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

// The [id] from the route context Next.js passes as the handler's second argument
async function idFrom(context: unknown): Promise<string | undefined> {
  const params = await (context as { params?: Promise<Record<string, unknown>> } | undefined)?.params;
  return typeof params?.id === "string" ? params.id : undefined;
}

export function withExists(resource: Resource): Middleware {
  return <Rest extends unknown[]>(handler: RouteHandler<Rest>) =>
    async (request: Request, ...rest: Rest) => {
      const id = await idFrom(rest[0]);
      // A failed lookup (e.g. the database is down) throws on to the error handler
      if (id !== undefined && isLookupId(id) && !(await exists(resource, Number(id)))) {
        return notFound(`No ${LABELS[resource]} with id ${id}`); // stop: the controller is not called
      }
      return handler(request, ...rest); // the row exists (or the id isn't a lookup id): next step
    };
}
