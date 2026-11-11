import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";
import { withExistingResource } from "@/lib/middleware";

// GET "/api/users/:id/applications" → user :id's applications, newest first (JSON)
// Nested route: the user id comes from the URL.
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/users/[id]/applications">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the user doesn't exist.
export const GET = withExistingResource("user")((request: Request, context: Context) =>
  ApiApplicationController.getAllForUser(request, context),
);
