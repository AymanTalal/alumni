import * as ApiUserController from "@/lib/controllers/ApiUserController";
import { withApiMiddleware } from "@/lib/middleware";

// GET  "/api/users" → list all users (JSON)
// POST "/api/users" → create a user from form-data (JSON, 201)
// Route → Controller → Model: this file only maps HTTP methods to ApiUserController,
// which validates the request, calls the User Model and builds the JSON response.

// Every handler goes through the API middleware line (lib/middleware): the logger, then the error
// handler (503 / 500 for unexpected errors).
export const GET = withApiMiddleware(() =>
  ApiUserController.getAll(),
);

export const POST = withApiMiddleware((request: Request) =>
  ApiUserController.create(request),
);
