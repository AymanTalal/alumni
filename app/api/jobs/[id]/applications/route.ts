import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";
import { withExistingResource } from "@/lib/middleware";

// GET  "/api/jobs/:id/applications" → the applications to job posting :id, newest first (JSON)
// POST "/api/jobs/:id/applications" → a user applies to job posting :id (JSON or form-data, 201)
// Nested route: the job posting id comes ONLY from the URL; a jobPostingId in the body is ignored.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/jobs/[id]/applications">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the job posting doesn't exist.
export const GET = withExistingResource("jobPosting")((request: Request, context: Context) =>
  ApiApplicationController.getAllForJob(request, context),
);

export const POST = withExistingResource("jobPosting")((request: Request, context: Context) =>
  ApiApplicationController.createForJob(request, context),
);
