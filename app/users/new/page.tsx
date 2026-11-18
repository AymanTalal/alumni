import { UserIcon } from "@/lib/views/ui/icons";
import PageBand from "@/lib/views/ui/PageBand";
import PageContainer from "@/lib/views/ui/PageContainer";
import Panel from "@/lib/views/ui/Panel";
import UserCreateForm from "@/lib/views/users/UserCreateForm";
import { createUserAction } from "../actions";

// Route: "/users/new"  (file: app/users/new/page.tsx)
// GET → Page: the band, then UserCreateForm (name, email, age) in one Panel (DESIGN.md §9).
// Submitting the form runs createUserAction (../actions.ts) → UserController.create, which shows
// the validation error in the form, or goes to the new user's page on success.

export const metadata = { title: "Add a graduate" };

export default function NewUserPage() {
  return (
    <PageContainer
      width="narrow"
      overlap
      band={
        <PageBand
          width="narrow"
          overlap
          back={{ href: "/users", label: "All graduates & students" }}
          title="Add a graduate"
          description="Their name is all you need; email and age can come later."
        />
      }
    >
      <Panel title="Graduate details" icon={<UserIcon />}>
        <UserCreateForm action={createUserAction} />
      </Panel>
    </PageContainer>
  );
}
