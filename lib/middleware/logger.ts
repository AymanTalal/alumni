// Logger middleware: writes ONE line to the terminal for every API request, on the way out:
//
//   HH:MM:SS METHOD PATH STATUS DURATIONms        e.g.  10:20:30 POST /api/users 201 18ms
//
//   - the time is Istanbul time (Europe/Istanbul), 24-hour
//   - PATH is the path only: the query string (?sort=year) is never logged
//   - STATUS is the status of the Response the handler returned; if the handler throws, the line
//     says 500 (Next.js answers 500 for a thrown error) and the error is thrown on unchanged
//   - DURATION is whole milliseconds, from just before the handler runs to when it finished
//
// It never logs the request body, headers, cookies or query values, which can hold emails or
// passwords. It doesn't change anything: the handler's Response is returned as it is, and if the
// logging itself fails, the request still works (the failure is ignored).
// Used through the middleware line in lib/middleware/index.ts.
//
// The same line format is used for PAGE requests (writeLogLine / logPageRequest, called by
// proxy.ts), with "-" for the status and duration, which Next.js doesn't give to a proxy.

import type { Middleware, RouteHandler } from "./chain";

// "10:20:30" in Istanbul time, 24-hour
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// Prints one line: "HH:MM:SS METHOD PATH STATUS DURATION". The ONE place the line format lives,
// for API and page requests. The path is the path only (the caller passes no query string).
export function writeLogLine(method: string, path: string, status: string, duration: string) {
  console.log(`${clock.format(new Date())} ${method} ${path} ${status} ${duration}`);
}

// API requests: the real status and duration. Any error here (e.g. an unusual URL) is swallowed,
// so logging can never break a request.
function logLine(request: Request, status: number, startedAt: number) {
  try {
    const duration = Math.round(performance.now() - startedAt);
    const path = new URL(request.url).pathname; // the path only, no query string
    writeLogLine(request.method, path, String(status), `${duration}ms`);
  } catch {
    // never let logging break the request
  }
}

// Page requests (from proxy.ts): logged when the request comes in, BEFORE the page runs, so the
// status and duration are not known yet and are written as "-" — except when the proxy answers
// itself with a redirect (status "308"). Never throws.
export function logPageRequest(request: Request, status = "-") {
  try {
    writeLogLine(request.method, new URL(request.url).pathname, status, "-");
  } catch {
    // never let logging break the page
  }
}

export const withLogger: Middleware = <Rest extends unknown[]>(handler: RouteHandler<Rest>) =>
  async (request: Request, ...rest: Rest) => {
    const startedAt = performance.now(); // start the timer
    try {
      const response = await handler(request, ...rest); // let the controller run ("next")
      logLine(request, response.status, startedAt); // on the way out
      return response;
    } catch (error) {
      logLine(request, 500, startedAt);
      throw error; // the current error behavior continues exactly as before
    }
  };
