import * as ApiUserController from "@/lib/controllers/ApiUserController";

// GET    "/api/users/:id" → one user (JSON)
// PUT    "/api/users/:id" → replace the whole user with form-data
// PATCH  "/api/users/:id" → change only the fields sent
// DELETE "/api/users/:id" → remove the user
// Route → Controller → Model: this file only maps HTTP methods to ApiUserController,
// which validates the request, calls the User Model and builds the JSON response.

type Context = RouteContext<"/api/users/[id]">;

export function GET(request: Request, context: Context) {
  return ApiUserController.getById(request, context);
}

export function PUT(request: Request, context: Context) {
  return ApiUserController.replace(request, context);
}

export function PATCH(request: Request, context: Context) {
  return ApiUserController.update(request, context);
}

export function DELETE(request: Request, context: Context) {
  return ApiUserController.delete(request, context);
}
