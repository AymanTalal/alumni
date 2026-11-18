import type { User } from "@/lib/models/user";
import Avatar from "../ui/Avatar";
import Chip from "../ui/Chip";
import { MapPinIcon } from "../ui/icons";
import LinkCard from "../ui/LinkCard";

// View: one person as a card (DESIGN.md §9, people cards) — the whole card links to /users/{id}:
// an initials avatar, the name, the department as a chip and the city if it exists (city is one of
// the user's extra fields). Real data only: a missing department or city is simply not shown.
// Markup only; used by the homepage ("Meet our community") and /users.

export default function PersonCard({ user }: { user: User }) {
  const city = typeof user.city === "string" && user.city.trim() !== "" ? user.city : undefined;
  return (
    <LinkCard href={`/users/${user.id}`} className="flex h-full flex-col items-center text-center">
      <Avatar name={user.name} size="lg" />
      <h3 className="mt-3 font-semibold break-words text-ink group-hover:text-primary">{user.name}</h3>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {user.department && <Chip tone="primary">{user.department}</Chip>}
        {city && <Chip icon={<MapPinIcon size={14} />}>{city}</Chip>}
      </div>
    </LinkCard>
  );
}
