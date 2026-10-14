// Turns PostgreSQL errors into messages the controllers can show to the client.
// Errors caused by the data that was sent (e.g. a duplicate value) become a clear validation
// message; anything else is logged on the server only and the client gets a generic message.

// PostgreSQL error codes (https://www.postgresql.org/docs/current/errcodes-appendix.html)
const CLIENT_ERRORS: Record<string, string> = {
  "23505": "A record with this value already exists", // unique_violation
  "23503": "This record refers to (or is referred to by) another record that doesn't allow it", // foreign_key_violation
  "23514": "A value is not allowed by the database rules", // check_violation
  "23502": "A required value is missing", // not_null_violation
  "22P02": "A value has the wrong format", // invalid_text_representation
  "22003": "A number is out of range", // numeric_value_out_of_range
};

export const INTERNAL_ERROR = "Internal server error";
export const PAGE_ERROR = "Something went wrong while saving. Please try again.";

// Returns a client-facing message for errors caused by the sent data, or null for anything else.
// For anything else, the real error is logged on the server (never sent to the client).
export function clientMessageFor(error: unknown): string | null {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === "string" && code in CLIENT_ERRORS) {
    // For unique / foreign key errors PostgreSQL's detail names the field, e.g.
    // 'Key (email)=(a@b.c) already exists.' Other details (e.g. "Failing row contains (…)")
    // would echo the whole row, so they are left out.
    const detail = (error as { detail?: unknown }).detail;
    const showDetail = (code === "23505" || code === "23503") && typeof detail === "string";
    return showDetail ? `${CLIENT_ERRORS[code]}: ${detail}` : CLIENT_ERRORS[code];
  }
  console.error("Database error:", error);
  return null;
}

// Wraps an API route handler: a database error becomes a 400 JSON error with a clear message if the
// sent data caused it, otherwise a generic 500 {"error": "Internal server error"} (logged on the server).
export function withDatabaseErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      const message = clientMessageFor(error);
      return Response.json({ error: message ?? INTERNAL_ERROR }, { status: message ? 400 : 500 });
    }
  };
}
