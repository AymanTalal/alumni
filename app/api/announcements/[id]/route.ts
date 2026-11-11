import * as ApiAnnouncementController from "@/lib/controllers/ApiAnnouncementController";
import { withExistingResource } from "@/lib/middleware";

// GET    "/api/announcements/:id" → one announcement (JSON)
// PUT    "/api/announcements/:id" → replace the whole announcement with form-data
// PATCH  "/api/announcements/:id" → change only the fields sent
// DELETE "/api/announcements/:id" → remove the announcement
// Route → Controller → Model: this file only maps HTTP methods to ApiAnnouncementController,
// which validates the request, calls the Announcement Model and builds the JSON response.

type Context = RouteContext<"/api/announcements/[id]">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the announcement doesn't exist.
export const GET = withExistingResource("announcement")((request: Request, context: Context) =>
  ApiAnnouncementController.getById(request, context),
);

export const PUT = withExistingResource("announcement")((request: Request, context: Context) =>
  ApiAnnouncementController.replace(request, context),
);

export const PATCH = withExistingResource("announcement")((request: Request, context: Context) =>
  ApiAnnouncementController.update(request, context),
);

export const DELETE = withExistingResource("announcement")((request: Request, context: Context) =>
  ApiAnnouncementController.delete(request, context),
);
