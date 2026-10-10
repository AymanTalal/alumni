import * as ApiAnnouncementController from "@/lib/controllers/ApiAnnouncementController";

// GET    "/api/announcements/:id" → one announcement (JSON)
// PUT    "/api/announcements/:id" → replace the whole announcement with form-data
// PATCH  "/api/announcements/:id" → change only the fields sent
// DELETE "/api/announcements/:id" → remove the announcement
// Route → Controller → Model: this file only maps HTTP methods to ApiAnnouncementController,
// which validates the request, calls the Announcement Model and builds the JSON response.

type Context = RouteContext<"/api/announcements/[id]">;

export function GET(request: Request, context: Context) {
  return ApiAnnouncementController.getById(request, context);
}

export function PUT(request: Request, context: Context) {
  return ApiAnnouncementController.replace(request, context);
}

export function PATCH(request: Request, context: Context) {
  return ApiAnnouncementController.update(request, context);
}

export function DELETE(request: Request, context: Context) {
  return ApiAnnouncementController.delete(request, context);
}
