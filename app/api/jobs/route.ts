import * as ApiJobPostingController from "@/lib/controllers/ApiJobPostingController";
import { withApiMiddleware } from "@/lib/middleware";

// GET  "/api/jobs" → list every job posting, newest first (JSON)
// POST "/api/jobs" → create a job posting from JSON or form-data (JSON, 201)
// Job postings have no owner; users are linked to postings only through applications (a later task).
// Route → Controller → Model: this file only maps HTTP methods to ApiJobPostingController,
// which calls the JobPosting Model (where the rules live) and builds the JSON response.

// Every handler goes through the API middleware line (lib/middleware): the logger, then the error
// handler (503 / 500 for unexpected errors).
export const GET = withApiMiddleware(() =>
  ApiJobPostingController.getAll(),
);

export const POST = withApiMiddleware((request: Request) =>
  ApiJobPostingController.create(request),
);
