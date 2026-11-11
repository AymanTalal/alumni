// The middleware lines every API route handler goes through (app/api/**/route.ts), built with
// chain() in order — the first one is the outermost: it sees the request first and the response last.
//
//   routes without an id:  request → withLogger → withErrorHandler → route handler → controller
//   routes with an [id]:   request → withLogger → withErrorHandler → withExists(resource) → route handler → controller
//
//   - withLogger is first, so it logs the FINAL status (also the error handler's 503 / 500 and the
//     guard's 404) and times the whole request.
//   - withErrorHandler catches every error from the guard, the route handler, the controller and
//     the Models, and answers one safe JSON shape (503 / 500), logging the stack once.
//   - withExists answers 404 { error, reason } and stops if the row in the URL doesn't exist.
// Later middlewares (e.g. validation) are added here, so every route gets them without changing
// the route files.
//
// Usage in a route.ts:
//   export const GET = withApiMiddleware(() => SomeController.getAll());
//   export const GET = withExistingResource("jobPosting")((request: Request, context: Context) => …);

import { chain } from "./chain";
import { withErrorHandler } from "./errorHandler";
import { withLogger } from "./logger";
import { type Resource, withExists } from "./notFoundGuard";

export const withApiMiddleware = chain(withLogger, withErrorHandler);

// The line for a route with an [id] in its path: the logger, the error handler, then the 404 guard
// for that resource.
export const withExistingResource = (resource: Resource) =>
  chain(withLogger, withErrorHandler, withExists(resource));
