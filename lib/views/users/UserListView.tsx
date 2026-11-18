import type { User } from "@/lib/models/user";
import EmptyState from "../ui/EmptyState";
import PersonCard from "./PersonCard";

// View: the people on /users as a grid of person cards (DESIGN.md §9, browsing pages): avatar,
// name, department chip, city — each card links to the person's page, where Edit and Delete are.
// Markup only: the page gets the users from UserController and passes them in.
// An empty list shows the empty state (illustration) with its ONE button, "Add a graduate".

export default function UserListView({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <EmptyState title="No graduates yet." action={{ href: "/users/new", label: "Add a graduate" }}>
        Add the first one to start the directory.
      </EmptyState>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {users.map((user) => (
        <li key={user.id} className="min-w-0">
          <PersonCard user={user} />
        </li>
      ))}
    </ul>
  );
}
