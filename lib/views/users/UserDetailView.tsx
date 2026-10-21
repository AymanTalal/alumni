import type { User } from "@/lib/models/user";
import { ButtonLink } from "../ui/Button";
import Card from "../ui/Card";
import PageHeader from "../ui/PageHeader";
import DeleteUserButton, { type DeleteUserState } from "./DeleteUserButton";

// View: shows one user with all of their fields, plus Edit and Delete buttons and a link
// back to the list. Markup and styling only, no data logic: the page gets the user from
// UserController and passes it in, together with the delete Server Action.

type Props = {
  user: User;
  deleteAction: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
};

export default function UserDetailView({ user, deleteAction }: Props) {
  return (
    <>
      <PageHeader
        back={{ href: "/users", label: "All users" }}
        title={user.name}
        actions={
          <>
            <ButtonLink href={`/users/${user.id}/edit`}>Edit</ButtonLink>
            <DeleteUserButton userId={user.id} userName={user.name} action={deleteAction} size="md" />
          </>
        }
      />

      <Card className="py-2 sm:py-2">
        <dl className="divide-y divide-border">
          {Object.entries(user).map(([field, value]) => (
            <div key={field} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
              <dt className="text-sm font-medium text-muted capitalize sm:w-40">{field}</dt>
              <dd className="break-words text-ink">{value === "" ? "—" : String(value)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  );
}
