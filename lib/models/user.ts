// User Model (the "M" in MVC).
// Owns the user data and the only functions allowed to read or change it.
// Stored in PostgreSQL (table "users", created by migrations/001_create_users.up.sql) and accessed
// with plain, parameterized SQL through lib/db.ts — no ORM. No HTTP or Next.js code here.

import { query } from "@/lib/db";

// A stored user, in the same flat shape as before the database: id, name, the known optional
// fields, and any extra (dynamic) fields side by side. Only "name" is required.
export type User = {
  id: number;
  name: string;
  email?: string;
  age?: number;
  department?: string;
  [field: string]: string | number | undefined;
};

// Data for creating or fully replacing a user: everything except the id.
// age may arrive as text from a form (e.g. "22"); the controllers check it is a whole number.
export type UserData = {
  name: string;
  [field: string]: string | number | undefined;
};

// Data for a partial update: any subset of fields, name included.
export type PartialUserData = Partial<UserData>;

// A row of the users table, as pg returns it (bigint comes back as a string)
type UserRow = {
  id: string;
  name: string;
  email: string | null;
  age: number | null;
  department: string | null;
  extra: Record<string, string | number>;
};

// The columns every query returns
const COLUMNS = "id, name, email, age, department, extra";

// Fields that have their own column; every other field goes into the extra jsonb column
const KNOWN_FIELDS = new Set(["id", "name", "email", "age", "department"]);

// Turns a database row into the flat User shape the controllers and views use.
// Empty (NULL) columns are left out, like fields that were never sent.
function toUser(row: UserRow): User {
  const user: User = { id: Number(row.id), name: row.name };
  if (row.email !== null) user.email = row.email;
  if (row.age !== null) user.age = row.age;
  if (row.department !== null) user.department = row.department;
  // Dynamic fields come after the columns (a column always wins over an extra field of the same name)
  for (const [key, value] of Object.entries(row.extra)) {
    if (!(key in user)) user[key] = value;
  }
  return user;
}

// Age column value: "" or missing → NULL, otherwise the number (the controllers validated it).
function toAge(value: string | number | undefined): number | null {
  return value === undefined || value === "" ? null : Number(value);
}

// Text column value: missing → NULL, otherwise the text as sent.
function toText(value: string | number | undefined): string | null {
  return value === undefined ? null : String(value);
}

// Every field that has no column of its own (undefined values are dropped).
function extraFields(data: PartialUserData): Record<string, string | number> {
  const extra: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!KNOWN_FIELDS.has(key) && value !== undefined) extra[key] = value;
  }
  return extra;
}

// An id from a URL can be anything ("abc", "1.5"); only whole numbers can match a row.
function isValidId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

// Adds a new user (the database assigns the id) and returns it.
export async function createUser(data: UserData): Promise<User> {
  const [row] = await query<UserRow>(
    `INSERT INTO users (name, email, age, department, extra)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [data.name, toText(data.email), toAge(data.age), toText(data.department), extraFields(data)],
  );
  return toUser(row);
}

// Returns every user, oldest first (an empty array if there are none).
export async function getAllUsers(): Promise<User[]> {
  const rows = await query<UserRow>(`SELECT ${COLUMNS} FROM users ORDER BY id`);
  return rows.map(toUser);
}

// Returns the user with this id, or undefined if there is none.
export async function getUserById(id: number): Promise<User | undefined> {
  if (!isValidId(id)) return undefined;
  const [row] = await query<UserRow>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return row ? toUser(row) : undefined;
}

// Replaces the whole user with new data, keeping the same id.
// Fields not included in data are removed. Returns the updated user, or undefined if not found.
export async function replaceUser(id: number, data: UserData): Promise<User | undefined> {
  if (!isValidId(id)) return undefined;
  const [row] = await query<UserRow>(
    `UPDATE users
     SET name = $2, email = $3, age = $4, department = $5, extra = $6, updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, data.name, toText(data.email), toAge(data.age), toText(data.department), extraFields(data)],
  );
  return row ? toUser(row) : undefined;
}

// Changes only the fields given and keeps every other field as it was.
// Returns the updated user, or undefined if not found.
// Each column gets a "was it sent?" flag, so the SQL text never changes: an unsent field keeps
// its value, and extra fields are merged into the existing extra object (jsonb ||).
export async function updateUser(
  id: number,
  partialData: PartialUserData,
): Promise<User | undefined> {
  if (!isValidId(id)) return undefined;
  const sent = (field: string) => partialData[field] !== undefined;
  const [row] = await query<UserRow>(
    `UPDATE users SET
       name       = CASE WHEN $2 THEN $3 ELSE name END,
       email      = CASE WHEN $4 THEN $5 ELSE email END,
       age        = CASE WHEN $6 THEN $7::integer ELSE age END,
       department = CASE WHEN $8 THEN $9 ELSE department END,
       extra      = extra || $10::jsonb,
       updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [
      id,
      sent("name"), toText(partialData.name),
      sent("email"), toText(partialData.email),
      sent("age"), toAge(partialData.age),
      sent("department"), toText(partialData.department),
      extraFields(partialData),
    ],
  );
  return row ? toUser(row) : undefined;
}

// Removes the user. Returns true if it was deleted, false if no user had this id.
export async function deleteUser(id: number): Promise<boolean> {
  if (!isValidId(id)) return false;
  const rows = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
