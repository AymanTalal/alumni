import * as ApiJobPostingController from "@/lib/controllers/ApiJobPostingController";

// GET    "/api/jobs/:id" → one job posting (JSON)
// PATCH  "/api/jobs/:id" → change only the fields sent (title, company)
// DELETE "/api/jobs/:id" → remove the job posting (204, no body)
// Route → Controller → Model: this file only maps HTTP methods to ApiJobPostingController,
// which calls the JobPosting Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/jobs/[id]">;

export function GET(request: Request, context: Context) {
  return ApiJobPostingController.getById(request, context);
}

export function PATCH(request: Request, context: Context) {
  return ApiJobPostingController.update(request, context);
}

export function DELETE(request: Request, context: Context) {
  return ApiJobPostingController.delete(request, context);
}
