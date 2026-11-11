import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";
import { withApiMiddleware } from "@/lib/middleware";

// GET "/api/applications" → list every application, newest first (JSON)
// Applications are created through the nested route POST /api/jobs/:id/applications.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

// Every handler goes through the API middleware line (lib/middleware): the logger, then the error
// handler (503 / 500 for unexpected errors).
export const GET = withApiMiddleware(() =>
  ApiApplicationController.getAll(),
);
