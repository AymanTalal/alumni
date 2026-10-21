import * as ApiJobPostingController from "@/lib/controllers/ApiJobPostingController";

// GET  "/api/jobs" → list every job posting, newest first (JSON)
// POST "/api/jobs" → create a job posting from JSON or form-data (JSON, 201)
// Job postings have no owner; users are linked to postings only through applications (a later task).
// Route → Controller → Model: this file only maps HTTP methods to ApiJobPostingController,
// which calls the JobPosting Model (where the rules live) and builds the JSON response.

export function GET() {
  return ApiJobPostingController.getAll();
}

export function POST(request: Request) {
  return ApiJobPostingController.create(request);
}
