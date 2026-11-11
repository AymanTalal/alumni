// The middleware "line" for API route handlers.
// A route handler is the function a route.ts exports (GET, POST, …): it gets the Request (and, for
// routes with an [id], the route context) and returns a Response. A middleware is written once and
// wraps a route handler: it can do something before the handler runs, call it (the "next" step),
// and do something with the Response on the way out.
//
// chain(a, b, c)(handler) puts the middlewares in a line in front of the handler, in that order:
// a request goes through a, then b, then c, then the handler; the response comes back through c,
// b, a. New middlewares (e.g. validation, an error handler) are added to the line in one place:
// lib/middleware/index.ts.

// A route handler: the Request, plus whatever else Next.js passes (the route context with params)
export type RouteHandler<Rest extends unknown[] = unknown[]> = (
  request: Request,
  ...rest: Rest
) => Response | Promise<Response>;

// A middleware takes a route handler and returns a new one with the same arguments
export type Middleware = <Rest extends unknown[]>(handler: RouteHandler<Rest>) => RouteHandler<Rest>;

// Puts the middlewares in front of a handler, the first one outermost (it sees the request first
// and the response last).
export function chain(...middlewares: Middleware[]) {
  return <Rest extends unknown[]>(handler: RouteHandler<Rest>): RouteHandler<Rest> =>
    middlewares.reduceRight<RouteHandler<Rest>>((next, middleware) => middleware(next), handler);
}
