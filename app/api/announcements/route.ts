import * as ApiAnnouncementController from "@/lib/controllers/ApiAnnouncementController";
import { withApiMiddleware } from "@/lib/middleware";

// GET  "/api/announcements" → list all announcements, newest first (JSON)
// POST "/api/announcements" → create an announcement from form-data (JSON, 201)
// Route → Controller → Model: this file only maps HTTP methods to ApiAnnouncementController,
// which validates the request, calls the Announcement Model and builds the JSON response.

// Every handler goes through the API middleware line (lib/middleware): the logger, then the error
// handler (503 / 500 for unexpected errors).
export const GET = withApiMiddleware(() =>
  ApiAnnouncementController.getAll(),
);

export const POST = withApiMiddleware((request: Request) =>
  ApiAnnouncementController.create(request),
);
