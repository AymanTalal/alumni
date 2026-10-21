import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";

// GET    "/api/applications/:id" → one application (JSON)
// PATCH  "/api/applications/:id" → change only the status; anything else in the body is ignored
// DELETE "/api/applications/:id" → remove the application (204, no body)
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/applications/[id]">;

export function GET(request: Request, context: Context) {
  return ApiApplicationController.getById(request, context);
}

export function PATCH(request: Request, context: Context) {
  return ApiApplicationController.updateStatus(request, context);
}

export function DELETE(request: Request, context: Context) {
  return ApiApplicationController.delete(request, context);
}
