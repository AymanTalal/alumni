// GET "/hello/:name" → plain text "Hello, {name}!"
// The [name] folder captures that part of the URL, e.g. /hello/Ayman → name = "Ayman".
export async function GET(
  _request: Request,
  { params }: RouteContext<"/hello/[name]">,
) {
  const { name } = await params;
  return new Response(`Hello, ${name}!`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
