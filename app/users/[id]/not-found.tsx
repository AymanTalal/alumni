import SectionNotFound from "@/lib/views/ui/SectionNotFound";

// Shown (with HTTP 404) when app/users/[id]/page.tsx calls notFound() for an unknown id.
// Same look as every 404 page (lib/views/ui/NotFoundView.tsx); an invalid id like "abc" is shown as
// "Invalid id" instead of the text below.
export default function UserNotFound() {
  return (
    <SectionNotFound
      title="User not found"
      reason="There is no user with this id."
      resource="user"
      back={{ href: "/users", label: "All users" }}
    />
  );
}
