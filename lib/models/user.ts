// User Model (the "M" in MVC).
// Owns the user data and the only functions allowed to read or change it.
// No HTTP or Next.js code here: this file only deals with data, so the in-memory array
// can later be swapped for a real database without changing the controllers.
// No database yet: data is lost when the server restarts.

// A stored user. Only "name" is required; any other fields (email, age, department, ...)
// are optional and kept as sent.
export type User = {
  id: number;
  name: string;
  email?: string;
  age?: string;
  department?: string;
  [field: string]: string | number | undefined;
};

// Data for creating or fully replacing a user: everything except the id.
export type UserData = {
  name: string;
  [field: string]: string | number | undefined;
};

// Data for a partial update: any subset of fields, name included.
export type PartialUserData = Partial<UserData>;

// The store: the users array and the next id (which only ever goes up, so deleted ids are
// never reused). Next.js loads this file separately for API routes and for pages, so a plain
// module-level array would give each side its own copy. Keeping the store on globalThis makes
// every part of the server share the same one. Other code must still go through the functions below.
type UserStore = { users: User[]; nextId: number };
const globalForUsers = globalThis as typeof globalThis & { userStore?: UserStore };
const store: UserStore = (globalForUsers.userStore ??= { users: [], nextId: 1 });
const users = store.users;

// Copies the given fields, dropping "id" (only the Model assigns ids)
// and undefined values (so they can't blank out existing fields).
function cleanFields(data: PartialUserData): PartialUserData {
  const fields: PartialUserData = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== "id" && value !== undefined) {
      fields[key] = value;
    }
  }
  return fields;
}

// Returns the array index of the user with this id, or -1 if there is none.
function indexOf(id: number): number {
  return users.findIndex((user) => user.id === id);
}

// Adds a new user with the next id and returns it.
export function createUser(data: UserData): User {
  const user: User = { id: store.nextId++, ...cleanFields(data), name: data.name };
  users.push(user);
  return { ...user };
}

// Returns every user (an empty array if there are none).
export function getAllUsers(): User[] {
  return users.map((user) => ({ ...user }));
}

// Returns the user with this id, or undefined if there is none.
export function getUserById(id: number): User | undefined {
  const user = users[indexOf(id)];
  return user ? { ...user } : undefined;
}

// Replaces the whole user with new data, keeping the same id.
// Fields not included in data are removed. Returns the updated user, or undefined if not found.
export function replaceUser(id: number, data: UserData): User | undefined {
  const index = indexOf(id);
  if (index === -1) return undefined;

  const user: User = { id, ...cleanFields(data), name: data.name };
  users[index] = user;
  return { ...user };
}

// Changes only the fields given and keeps every other field as it was.
// Returns the updated user, or undefined if not found.
export function updateUser(id: number, partialData: PartialUserData): User | undefined {
  const index = indexOf(id);
  if (index === -1) return undefined;

  const user: User = { ...users[index], ...cleanFields(partialData), id };
  users[index] = user;
  return { ...user };
}

// Removes the user. Returns true if it was deleted, false if no user had this id.
export function deleteUser(id: number): boolean {
  const index = indexOf(id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}
