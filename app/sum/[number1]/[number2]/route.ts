// GET "/sum/:number1/:number2" → plain text sum, e.g. /sum/2/3 → "5"
// Two dynamic folders capture two URL values: /sum/2/3 → { number1: "2", number2: "3" }.

// URL params are always strings, so convert them. Returns null if not a valid number.
function toNumber(value: string): number | null {
  if (value.trim() === "") return null; // Number("") would give 0
  const n = Number(value);
  return Number.isFinite(n) ? n : null; // rejects "abc" (NaN) and "Infinity"
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/sum/[number1]/[number2]">,
) {
  const { number1, number2 } = await params;
  const a = toNumber(number1);
  const b = toNumber(number2);

  if (a === null || b === null) {
    return new Response(
      `Error: both values must be numbers (got "${number1}" and "${number2}")`,
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  return new Response(String(a + b), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
