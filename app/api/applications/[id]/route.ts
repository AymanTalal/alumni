import * as ApiApplicationController from "@/lib/controllers/ApiApplicationController";
import { withExistingResource } from "@/lib/middleware";

// GET    "/api/applications/:id" → one application (JSON)
// PATCH  "/api/applications/:id" → change only the status; anything else in the body is ignored
// DELETE "/api/applications/:id" → remove the application (204, no body)
// Route → Controller → Model: this file only maps HTTP methods to ApiApplicationController,
// which calls the Application Model (where the rules live) and builds the JSON response.

type Context = RouteContext<"/api/applications/[id]">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the application doesn't exist.
export const GET = withExistingResource("application")((request: Request, context: Context) =>
  ApiApplicationController.getById(request, context),
);

export const PATCH = withExistingResource("application")((request: Request, context: Context) =>
  ApiApplicationController.updateStatus(request, context),
);

export const DELETE = withExistingResource("application")((request: Request, context: Context) =>
  ApiApplicationController.delete(request, context),
);
