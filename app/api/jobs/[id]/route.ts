import * as ApiJobPostingController from "@/lib/controllers/ApiJobPostingController";
import { withExistingResource } from "@/lib/middleware";

// GET    "/api/jobs/:id" → one job posting (JSON)
// PATCH  "/api/jobs/:id" → change only the fields sent (title, company)
// DELETE "/api/jobs/:id" → remove the job posting (204, no body)
// Route → Controller → Model: this file only maps HTTP methods to ApiJobPostingController,
// which calls the JobPosting Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/jobs/[id]">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the job posting doesn't exist.
export const GET = withExistingResource("jobPosting")((request: Request, context: Context) =>
  ApiJobPostingController.getById(request, context),
);

export const PATCH = withExistingResource("jobPosting")((request: Request, context: Context) =>
  ApiJobPostingController.update(request, context),
);

export const DELETE = withExistingResource("jobPosting")((request: Request, context: Context) =>
  ApiJobPostingController.delete(request, context),
);
