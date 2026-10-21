import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";

// GET "/api/applications" → list every application, newest first (JSON)
// Applications are created through the nested route POST /api/jobs/:id/applications.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

export function GET() {
  return ApiApplicationController.getAll();
}
