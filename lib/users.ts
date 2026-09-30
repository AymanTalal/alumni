// Temporary in-memory user store, shared by app/api/users/route.ts and
// app/api/users/[id]/route.ts. No database yet: data is lost when the server restarts.

// Only "name" is required; any other fields (email, age, department, ...) are stored as sent.
export type User = {
  id: number;
  name: string;
  [field: string]: string | number;
};

export const users: User[] = [];
let nextId = 1;

export function getNextId(): number {
  return nextId++;
}

export function findUser(id: number): User | undefined {
  return users.find((user) => user.id === id);
}

// Reads the form-data body into a plain object with every text field sent.
// Uploaded files are skipped, and a client-sent "id" is ignored (the server assigns ids).
// Returns null if the body isn't form-data (request.formData() throws for JSON or an empty body).
export async function readFormFields(
  request: Request,
): Promise<Record<string, string> | null> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return null;
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && key !== "id") {
      fields[key] = value;
    }
  }
  return fields;
}
