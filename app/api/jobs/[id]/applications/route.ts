import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";

// GET  "/api/jobs/:id/applications" → the applications to job posting :id, newest first (JSON)
// POST "/api/jobs/:id/applications" → a user applies to job posting :id (JSON or form-data, 201)
// Nested route: the job posting id comes ONLY from the URL; a jobPostingId in the body is ignored.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/jobs/[id]/applications">;

export function GET(request: Request, context: Context) {
  return ApiApplicationController.getAllForJob(request, context);
}

export function POST(request: Request, context: Context) {
  return ApiApplicationController.createForJob(request, context);
}
