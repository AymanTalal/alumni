import * as ApiAnnouncementController from "@/lib/controllers/ApiAnnouncementController";

// GET  "/api/announcements" → list all announcements, newest first (JSON)
// POST "/api/announcements" → create an announcement from form-data (JSON, 201)
// Route → Controller → Model: this file only maps HTTP methods to ApiAnnouncementController,
// which validates the request, calls the Announcement Model and builds the JSON response.

export function GET() {
  return ApiAnnouncementController.getAll();
}

export function POST(request: Request) {
  return ApiAnnouncementController.create(request);
}
