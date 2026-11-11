import { notFound } from "@/lib/http/notFound";
import { withApiMiddleware } from "@/lib/middleware";

// ANY method on "/api/<anything no other route matches>" → JSON 404, e.g.
//   GET /api/doesnotexist  →  404 { "error": "not found", "reason": "No route matches GET /api/doesnotexist" }
// [...path] is a catch-all segment: Next.js only uses it when no more specific route matches, so
// /api/health, /api/swagger, /api/jobs/[id], … keep working. A wrong method on an existing path
// (e.g. PUT /api/jobs) is still answered by Next.js itself (405). Goes through the API middleware
// line (logger, error handler) like every API route. The path is reported without the query string.

const noRoute = withApiMiddleware((request: Request) =>
  notFound(`No route matches ${request.method} ${new URL(request.url).pathname}`),
);

export const GET = noRoute;
export const POST = noRoute;
export const PUT = noRoute;
export const PATCH = noRoute;
export const DELETE = noRoute;
