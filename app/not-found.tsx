import NotFoundView from "@/lib/views/ui/NotFoundView";

// The generic 404 page (HTTP 404): shown for every URL no page matches (e.g. /hello123,
// /applications/x), and for a notFound() call that has no nearer not-found.tsx. Unknown URLs are
// not redirected to the home page: a 404 tells people and search engines the address doesn't exist.
// The section pages (e.g. app/jobs/[id]/not-found.tsx) use the same look with their own text.
export default function NotFound() {
  return <NotFoundView title="Page not found" reason="There is no page at this address." />;
}
