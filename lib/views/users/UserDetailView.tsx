import type { User } from "@/lib/models/user";
import Avatar from "../ui/Avatar";
import { ButtonLink } from "../ui/Button";
import Chip from "../ui/Chip";
import DetailHeader from "../ui/DetailHeader";
import { BuildingIcon, MapPinIcon, UserIcon } from "../ui/icons";
import DeleteUserButton, { type DeleteUserState } from "./DeleteUserButton";

// View: the profile header card on /users/{id} (DESIGN.md §9, detail pages) — it overlaps the page
// band: a large initials avatar, the name (<h1>), the email, and chips with the real facts
// (department, city, age, and any other extra field); on the right Edit (secondary) and Delete
// (danger, asks first) — no primary button here. Markup only: the page gets the user from
// UserController and passes it in, together with the delete Server Action.

// Fields with their own place in the card; every other extra field becomes a chip
const SHOWN = new Set(["id", "name", "email", "department", "age", "city"]);

// "graduationYear" → "Graduation year" (for the extra fields)
function labelFor(field: string): string {
  const words = field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

type Props = {
  user: User;
  deleteAction: (userId: number, state: DeleteUserState, formData: FormData) => Promise<DeleteUserState>;
};

export default function UserDetailView({ user, deleteAction }: Props) {
  const city = typeof user.city === "string" && user.city.trim() !== "" ? user.city : undefined;
  const extras = Object.entries(user).filter(([field, value]) => !SHOWN.has(field) && value !== undefined && value !== "");

  return (
    <DetailHeader
      media={<Avatar name={user.name} size="xl" />}
      title={user.name}
      subtitle={user.email ? <span className="break-all">{user.email}</span> : "Email: Not given"}
      chips={
        <>
          {user.department && (
            <Chip tone="primary" icon={<BuildingIcon size={14} />}>
              {user.department}
            </Chip>
          )}
          {city && <Chip icon={<MapPinIcon size={14} />}>{city}</Chip>}
          {user.age !== undefined && <Chip icon={<UserIcon size={14} />}>Age {user.age}</Chip>}
          {extras.map(([field, value]) => (
            <Chip key={field}>
              {labelFor(field)}: {String(value)}
            </Chip>
          ))}
        </>
      }
      actions={
        <>
          <ButtonLink href={`/users/${user.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteUserButton userId={user.id} userName={user.name} action={deleteAction} size="md" />
        </>
      }
    />
  );
}
