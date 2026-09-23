// GET "/hello" → plain text "Hello, World!"
export function GET() {
  return new Response("Hello, World!", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
