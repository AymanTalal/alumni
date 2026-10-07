import * as ApiUserController from "@/lib/controllers/ApiUserController";

// GET  "/api/users" → list all users (JSON)
// POST "/api/users" → create a user from form-data (JSON, 201)
// Route → Controller → Model: this file only maps HTTP methods to ApiUserController,
// which validates the request, calls the User Model and builds the JSON response.

export function GET() {
  return ApiUserController.getAll();
}

export function POST(request: Request) {
  return ApiUserController.create(request);
}
