import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";

// GET "/api/users/:id/applications" → user :id's applications, newest first (JSON)
// Nested route: the user id comes from the URL.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/users/[id]/applications">;

export function GET(request: Request, context: Context) {
  return ApiApplicationController.getAllForUser(request, context);
}
