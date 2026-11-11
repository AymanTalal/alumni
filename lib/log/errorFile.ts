// Writes server errors (the error handler's 500 / 503) to logs/error.log, one readable entry each:
//
//   ==================================================================
//   time:    2026-11-11 10:20:30 (Istanbul time)
//   request: GET /api/users
//   status:  503
//   error:   Error: getaddrinfo ENOTFOUND db
//   stack:
//       at …
//
// Only what the error handler passes in is written: the method, the path (never the query string),
// the status and the error. Request bodies, headers, cookies and query values are never written.
// The logs folder is created if it is missing and the file is only ever appended to. Writing can
// never break a request: if it fails, the failure is reported in the terminal and the answer is
// sent as usual. In Docker, ./logs on the host is mounted at /app/logs (docker-compose.yml).

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "error.log");
const SEPARATOR = "=".repeat(66);

// "2026-11-11 10:20:30" in Istanbul time, 24-hour (the sv-SE locale writes dates as YYYY-MM-DD)
const timestamp = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// The error's "Name: message" line and its stack frames (or the value, if something other than an
// Error was thrown)
function describe(error: unknown): { summary: string; stack: string } {
  if (error instanceof Error) {
    const summary = `${error.name}: ${error.message}`;
    // A stack starts with the "Name: message" line(s); keep only the "at …" frames below them
    const frames = (error.stack ?? "").split("\n").filter((line) => /^\s+at /.test(line));
    return { summary, stack: frames.length > 0 ? frames.join("\n") : "    (no stack trace)" };
  }
  return { summary: `Non-Error value thrown: ${String(error)}`, stack: "    (no stack trace)" };
}

export async function appendErrorEntry(entry: {
  method: string;
  path: string;
  status: number;
  error: unknown;
}): Promise<void> {
  try {
    const { summary, stack } = describe(entry.error);
    const text =
      `${SEPARATOR}\n` +
      `time:    ${timestamp.format(new Date())} (Istanbul time)\n` +
      `request: ${entry.method} ${entry.path}\n` +
      `status:  ${entry.status}\n` +
      `error:   ${summary}\n` +
      `stack:\n${stack}\n\n`;
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, text, "utf8");
  } catch (failure) {
    // never let the log file break the answer; say so in the terminal instead
    try {
      console.error(`Could not write ${LOG_FILE}:`, failure instanceof Error ? failure.message : failure);
    } catch {
      // nothing more to do
    }
  }
}
