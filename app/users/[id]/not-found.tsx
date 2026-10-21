import EmptyState from "@/lib/views/ui/EmptyState";
import PageContainer from "@/lib/views/ui/PageContainer";
import PageHeader from "@/lib/views/ui/PageHeader";

// Shown (with HTTP 404) when app/users/[id]/page.tsx calls notFound() for an unknown id.
export default function UserNotFound() {
  return (
    <PageContainer width="narrow">
      <PageHeader back={{ href: "/users", label: "All users" }} title="User not found" />
      <EmptyState title="There is no user with this id.">Check the link, or go back to the list.</EmptyState>
    </PageContainer>
  );
}
