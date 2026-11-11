import * as ApiUserController from "@/lib/controllers/ApiUserController";
import { withExistingResource } from "@/lib/middleware";

// GET    "/api/users/:id" → one user (JSON)
// PUT    "/api/users/:id" → replace the whole user with form-data
// PATCH  "/api/users/:id" → change only the fields sent
// DELETE "/api/users/:id" → remove the user
// Route → Controller → Model: this file only maps HTTP methods to ApiUserController,
// which validates the request, calls the User Model and builds the JSON response.

type Context = RouteContext<"/api/users/[id]">;

// Every handler goes through the API middleware line (lib/middleware): the logger, the error
// handler (503 / 500 for unexpected errors), then the 404 guard, which answers 404 { error, reason }
// without calling the handler if the user doesn't exist.
export const GET = withExistingResource("user")((request: Request, context: Context) =>
  ApiUserController.getById(request, context),
);

export const PUT = withExistingResource("user")((request: Request, context: Context) =>
  ApiUserController.replace(request, context),
);

export const PATCH = withExistingResource("user")((request: Request, context: Context) =>
  ApiUserController.update(request, context),
);

export const DELETE = withExistingResource("user")((request: Request, context: Context) =>
  ApiUserController.delete(request, context),
);
