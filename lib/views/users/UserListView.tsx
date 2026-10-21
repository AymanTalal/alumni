import type { User } from "@/lib/models/user";
import { ButtonLink } from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableHead, Td, Th, Tr } from "../ui/Table";
import TextLink from "../ui/TextLink";
import DeleteUserButton, { type DeleteUserState } from "./DeleteUserButton";

// View: renders a list of users as a table, with View / Edit / Delete for each row.
// Markup and styling only, no data logic: the page gets the users from UserController
// and passes them in, together with the delete Server Action.

// Fields shown in the table; any other fields are visible on the user's own page
const COLUMNS = ["email", "department", "age"] as const;

type Props = {
  users: User[];
  deleteAction: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
};

export default function UserListView({ users, deleteAction }: Props) {
  if (users.length === 0) {
    return (
      <EmptyState title="No users yet.">
        Add one with the form above, or with <code>POST /api/users</code>.
      </EmptyState>
    );
  }

  return (
    <Table>
      <TableHead>
        <Th>ID</Th>
        <Th>Name</Th>
        {COLUMNS.map((column) => (
          <Th key={column}>{column}</Th>
        ))}
        <Th>Actions</Th>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <Tr key={user.id}>
            <Td className="text-muted">{user.id}</Td>
            <Td>
              <TextLink href={`/users/${user.id}`}>{user.name}</TextLink>
            </Td>
            {COLUMNS.map((column) => (
              <Td key={column}>
                {user[column] === undefined || user[column] === "" ? "—" : user[column]}
              </Td>
            ))}
            <Td>
              <div className="flex flex-wrap items-start gap-2">
                <ButtonLink href={`/users/${user.id}`} variant="secondary" size="sm">
                  View
                </ButtonLink>
                <ButtonLink href={`/users/${user.id}/edit`} variant="secondary" size="sm">
                  Edit
                </ButtonLink>
                <DeleteUserButton userId={user.id} userName={user.name} action={deleteAction} />
              </div>
            </Td>
          </Tr>
        ))}
      </TableBody>
    </Table>
  );
}
