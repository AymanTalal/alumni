// Hand-written OpenAPI 3 spec for the API routes. Rendered by Swagger UI at /api/swagger.
// Keep this in sync when routes change.

const jsonError = (example: string) => ({
  description: example,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: example },
    },
  },
});

const userResponse = (description: string, example: object) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/User" },
      example,
    },
  },
});

const idParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The user's id",
  schema: { type: "integer", example: 1 },
};

const notFound = jsonError('User with id "999" not found');

// A 400 that can happen for more than one reason: each reason is shown as a named example
const badRequest = (examples: Record<string, string>) => ({
  description: "Invalid request body",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      examples: Object.fromEntries(
        Object.entries(examples).map(([summary, error]) => [
          summary.replace(/\W+/g, "_"),
          { summary, value: { error } },
        ]),
      ),
    },
  },
});

// The /users pages' forms run Next.js Server Actions. They aren't normal API endpoints, so no
// request body is documented for them; this note and these responses describe what really happens.
const SERVER_ACTION_NOTE =
  "**This is not a normal API endpoint, so no request body is documented here.** The browser " +
  "sends a `Next-Action` header holding an action ID that Next.js generates at build time (it " +
  "changes between builds), and React encodes the body in its own format. A plain POST from " +
  "Postman, curl or **Try it out** has no valid action ID, so it does not run the action and " +
  "changes no data.\n\n";

const serverActionResponses = {
  200: {
    description:
      "Sent by the page's own form: a React Server Components payload the browser uses to show " +
      "the result (a message, a validation error, or a redirect, which happens in the browser). " +
      "Validation errors also use status 200.",
    content: { "text/x-component": { schema: { type: "string" } } },
  },
  404: {
    description: "The `Next-Action` header doesn't match any Server Action in this build. No data is changed.",
  },
  500: {
    description:
      "A `multipart/form-data` POST without an action ID (e.g. from Postman or Try it out): " +
      "Next.js can't find the Server Action. No data is changed.",
  },
};

// Response for the HTML pages (/users, /users/{id}), which return a rendered web page, not JSON
const htmlResponse = (description: string) => ({
  description,
  content: { "text/html": { schema: { type: "string" } } },
});

// 500 for the JSON API: a database problem that wasn't caused by the sent data (e.g. the database is
// down). The real error is logged on the server; the client only gets this generic message.
const serverError = {
  description: "Unexpected database error (e.g. the database is unreachable). Details are logged on the server only.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: "Internal server error" },
    },
  },
};

const NOT_FORM_DATA = "Request body must be form-data";
const AGE_INVALID = '"age" must be a whole number (0 or more)';
// Example of a value PostgreSQL itself rejects (e.g. an age larger than an integer column allows)
const DB_REJECTED = "A number is out of range";
const NAME_REQUIRED = '"name" is required and must be a non-empty string';

// ---- Announcements ----

const announcementIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "The announcement's id (a whole number; anything else returns 400)",
  schema: { type: "integer", example: 1 },
};

const announcementResponse = (description: string, example: object) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Announcement" },
      example,
    },
  },
});

const exampleAnnouncement = {
  id: 1,
  title: "Alumni reunion",
  content: "Join us on campus on 12 June 2027.",
  author: "Alumni Office",
  createdAt: "2026-10-10T09:30:00.000Z",
  updatedAt: "2026-10-10T09:30:00.000Z",
};

const announcementNotFound = jsonError('Announcement with id "999" not found');

const TITLE_REQUIRED = '"title" is required and must be a non-empty string';
const CONTENT_REQUIRED = '"content" is required and must be a non-empty string';
const INVALID_ANNOUNCEMENT_ID = 'Announcement id "abc" is not a valid number';

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Alumni Tracking System API",
    version: "0.1.0",
    description:
      "API for the Alumni Tracking System (YBSB3001 Web Programming). " +
      "Users and announcements are stored in PostgreSQL (plain SQL, no ORM), so they survive " +
      "restarts; ids and timestamps are assigned by the database. The API and the HTML pages " +
      "share the same data: a user created with " +
      "POST /api/users appears at /users, and an announcement created with " +
      "POST /api/announcements appears at /announcements.",
  },
  tags: [
    { name: "Health", description: "Server status" },
    { name: "API Users", description: "JSON API: create, read, update and delete users" },
    {
      name: "Users (pages)",
      description:
        "HTML pages and browser forms that list, create, edit and delete the same users as the API",
    },
    {
      name: "API Announcements",
      description: "JSON API: create, read, update and delete announcements",
    },
    {
      name: "Announcements (pages)",
      description:
        "HTML pages and browser forms that list, create, edit and delete the same announcements " +
        "as the API",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        operationId: "getHealth",
        summary: "Check that the server is running",
        responses: {
          200: {
            description: "Server is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" } },
                },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["API Users"],
        operationId: "listUsers",
        summary: "List all users",
        description:
          "Returns every user in the database, oldest first, or an empty array if there are none.",
        responses: {
          200: {
            description: "Array of users",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/User" } },
                example: [
                  { id: 1, name: "Ayman", email: "ayman@example.com" },
                  { id: 2, name: "Elif", department: "MIS", age: 23, city: "Istanbul" },
                ],
              },
            },
          },
          500: serverError,
        },
      },
      post: {
        tags: ["API Users"],
        operationId: "createUser",
        summary: "Create a user",
        description:
          "Send form-data. Only `name` is required. `email`, `age` and `department` are stored " +
          "in their own columns (`age` must be a whole number, and is returned as a number); every " +
          "other text field is stored as-is in the `extra` jsonb column and returned alongside the " +
          "others. The database assigns the `id`: an `id` field in the body is ignored, and so " +
          "are uploaded files.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          201: userResponse("User created", {
            id: 1,
            name: "Ayman",
            email: "ayman@example.com",
            department: "MIS",
          }),
          400: badRequest({
            "Body is not form-data": NOT_FORM_DATA,
            "name missing or blank": NAME_REQUIRED,
            "age is not a whole number": AGE_INVALID,
            "value rejected by the database": DB_REJECTED,
          }),
          500: serverError,
        },
      },
    },
    "/api/users/{id}": {
      parameters: [idParam],
      get: {
        tags: ["API Users"],
        operationId: "getUser",
        summary: "Get one user",
        responses: {
          200: userResponse("The user", { id: 1, name: "Ayman", email: "ayman@example.com" }),
          404: notFound,
          500: serverError,
        },
      },
      put: {
        tags: ["API Users"],
        operationId: "replaceUser",
        summary: "Replace a user",
        description:
          "Replaces the whole user with the form-data sent. Fields not sent are removed (columns " +
          "become empty, `extra` is replaced). `name` is required, `age` must be a whole number. " +
          "The `id` never changes.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          200: userResponse("Updated user", { id: 1, name: "Ayman Ramadan", department: "MIS" }),
          400: badRequest({
            "Body is not form-data": NOT_FORM_DATA,
            "name missing or blank": NAME_REQUIRED,
            "age is not a whole number": AGE_INVALID,
            "value rejected by the database": DB_REJECTED,
          }),
          404: notFound,
          500: serverError,
        },
      },
      patch: {
        tags: ["API Users"],
        operationId: "updateUser",
        summary: "Update some fields of a user",
        description:
          "Changes only the fields sent and keeps all other fields (extra fields are merged into " +
          "`extra`). `name` is optional, but can't be blank if sent; `age` must be a whole number.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/UserPatch" },
            },
          },
        },
        responses: {
          200: userResponse("Updated user", {
            id: 1,
            name: "Ayman",
            email: "ayman@example.com",
            city: "Istanbul",
          }),
          400: badRequest({
            "Body is not form-data": NOT_FORM_DATA,
            "name sent but blank": NAME_REQUIRED,
            "age is not a whole number": AGE_INVALID,
            "value rejected by the database": DB_REJECTED,
          }),
          404: notFound,
          500: serverError,
        },
      },
      delete: {
        tags: ["API Users"],
        operationId: "deleteUser",
        summary: "Delete a user",
        responses: {
          200: {
            description: "User deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    id: { type: "integer" },
                  },
                },
                example: { message: "User deleted", id: 1 },
              },
            },
          },
          404: notFound,
          500: serverError,
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users (pages)"],
        operationId: "usersPage",
        summary: "Users list page (HTML)",
        description:
          "Renders an HTML page with an \"Add a user\" form (name required, email, age) and a " +
          "table of all users (id, name, email, department, age), each with **View**, **Edit** and " +
          "**Delete** actions. Shows a short message when there are no users yet.",
        responses: {
          200: htmlResponse("HTML page with the form and the list of users"),
        },
      },
      post: {
        tags: ["Users (pages)"],
        operationId: "usersPageFormActions",
        summary: "Create or delete a user from the /users page (Server Actions, browser only)",
        description:
          "Two forms on `/users` submit to this URL, and Next.js runs the matching **Server Action** " +
          "from `app/users/actions.ts`:\n\n" +
          "- the **\"Add a user\"** form → `createUserAction` → `UserController.create`. On success " +
          "the form shows \"User … created with id …\" and the list refreshes; a missing name is " +
          "shown as an error in the form.\n" +
          "- a row's **Delete** button (after a browser confirmation) → `deleteUserAction` → " +
          "`UserController.delete`. On success the list refreshes; if the user no longer exists, " +
          "\"User with id … not found\" is shown next to the button.\n\n" +
          SERVER_ACTION_NOTE +
          "**To create or delete users from Postman or scripts, use `POST /api/users` and " +
          "`DELETE /api/users/{id}`.**",
        responses: serverActionResponses,
      },
    },
    "/users/{id}": {
      parameters: [idParam],
      get: {
        tags: ["Users (pages)"],
        operationId: "userPage",
        summary: "User profile page (HTML)",
        description:
          "Renders an HTML page showing every field of one user, with an **Edit** link, a " +
          "**Delete** button and a link back to the list.",
        responses: {
          200: htmlResponse("HTML page with the user's fields"),
          404: htmlResponse('HTML "User not found" page, when no user has this id'),
        },
      },
      post: {
        tags: ["Users (pages)"],
        operationId: "userPageDeleteAction",
        summary: "Delete the user from their profile page (Server Action, browser only)",
        description:
          "The **Delete** button on `/users/{id}` asks the browser for confirmation, then submits to " +
          "this URL. Next.js runs `deleteUserAction` (`app/users/actions.ts`), which calls " +
          "`UserController.delete`. On success the browser is redirected to `/users`; if the user " +
          "no longer exists, \"User with id … not found\" is shown next to the button.\n\n" +
          SERVER_ACTION_NOTE +
          "**To delete users from Postman or scripts, use `DELETE /api/users/{id}`.**",
        responses: serverActionResponses,
      },
    },
    "/users/{id}/edit": {
      parameters: [idParam],
      get: {
        tags: ["Users (pages)"],
        operationId: "userEditPage",
        summary: "Edit user page (HTML)",
        description:
          "Renders an HTML form with the user's name, email and age pre-filled. Other fields " +
          "(department, …) are kept as they are when the form is saved.",
        responses: {
          200: htmlResponse("HTML page with the pre-filled edit form"),
          404: htmlResponse('HTML "User not found" page, when no user has this id'),
        },
      },
      post: {
        tags: ["Users (pages)"],
        operationId: "userEditFormAction",
        summary: "Save the edit form (Server Action, browser only)",
        description:
          "Submitting the edit form sends the request to this URL. Next.js runs `updateUserAction` " +
          "(`app/users/actions.ts`), which calls `UserController.update` with `name`, `email` and " +
          "`age` (other fields are kept). On success the browser is redirected to `/users/{id}`; " +
          "a missing name, or a user that no longer exists, is shown as an error in the form.\n\n" +
          SERVER_ACTION_NOTE +
          "**To update users from Postman or scripts, use `PUT` or `PATCH /api/users/{id}`.**",
        responses: serverActionResponses,
      },
    },
    "/api/announcements": {
      get: {
        tags: ["API Announcements"],
        operationId: "listAnnouncements",
        summary: "List all announcements",
        description:
          "Returns every announcement, newest first, or an empty array if there are none.",
        responses: {
          200: {
            description: "Array of announcements, newest first",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Announcement" } },
                example: [
                  {
                    id: 2,
                    title: "Career fair",
                    content: "Meet employers in the main hall.",
                    createdAt: "2026-10-11T08:00:00.000Z",
                    updatedAt: "2026-10-11T08:00:00.000Z",
                  },
                  exampleAnnouncement,
                ],
              },
            },
          },
          500: serverError,
        },
      },
      post: {
        tags: ["API Announcements"],
        operationId: "createAnnouncement",
        summary: "Create an announcement",
        description:
          "Send form-data. `title` and `content` are required, `author` is optional. The database " +
          "assigns the `id` and sets `createdAt` and `updatedAt`; any other fields are ignored.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AnnouncementInput" },
            },
          },
        },
        responses: {
          201: announcementResponse("Announcement created", exampleAnnouncement),
          400: badRequest({
            "Body is not form-data": NOT_FORM_DATA,
            "title missing or blank": TITLE_REQUIRED,
            "content missing or blank": CONTENT_REQUIRED,
          }),
          500: serverError,
        },
      },
    },
    "/api/announcements/{id}": {
      parameters: [announcementIdParam],
      get: {
        tags: ["API Announcements"],
        operationId: "getAnnouncement",
        summary: "Get one announcement",
        responses: {
          200: announcementResponse("The announcement", exampleAnnouncement),
          400: badRequest({ "id is not a whole number": INVALID_ANNOUNCEMENT_ID }),
          404: announcementNotFound,
          500: serverError,
        },
      },
      put: {
        tags: ["API Announcements"],
        operationId: "replaceAnnouncement",
        summary: "Replace an announcement",
        description:
          "Replaces the announcement with the form-data sent. `title` and `content` are required; " +
          "`author` is removed if not sent. The `id` and `createdAt` never change, and `updatedAt` " +
          "is set to now.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AnnouncementInput" },
            },
          },
        },
        responses: {
          200: announcementResponse("Updated announcement", {
            ...exampleAnnouncement,
            title: "Alumni reunion (new date)",
            content: "Moved to 19 June 2027.",
            author: undefined,
            updatedAt: "2026-10-12T14:00:00.000Z",
          }),
          400: badRequest({
            "id is not a whole number": INVALID_ANNOUNCEMENT_ID,
            "Body is not form-data": NOT_FORM_DATA,
            "title missing or blank": TITLE_REQUIRED,
            "content missing or blank": CONTENT_REQUIRED,
          }),
          404: announcementNotFound,
          500: serverError,
        },
      },
      patch: {
        tags: ["API Announcements"],
        operationId: "updateAnnouncement",
        summary: "Update some fields of an announcement",
        description:
          "Changes only the fields sent and keeps the rest. `title` and `content` are optional " +
          "here, but can't be blank if sent. `updatedAt` is set to now.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/AnnouncementPatch" },
            },
          },
        },
        responses: {
          200: announcementResponse("Updated announcement", {
            ...exampleAnnouncement,
            content: "Join us on campus on 12 June 2027. Registration opens soon.",
            updatedAt: "2026-10-12T14:00:00.000Z",
          }),
          400: badRequest({
            "id is not a whole number": INVALID_ANNOUNCEMENT_ID,
            "Body is not form-data": NOT_FORM_DATA,
            "title sent but blank": TITLE_REQUIRED,
            "content sent but blank": CONTENT_REQUIRED,
          }),
          404: announcementNotFound,
          500: serverError,
        },
      },
      delete: {
        tags: ["API Announcements"],
        operationId: "deleteAnnouncement",
        summary: "Delete an announcement",
        responses: {
          200: {
            description: "Announcement deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    id: { type: "integer" },
                  },
                },
                example: { message: "Announcement deleted", id: 1 },
              },
            },
          },
          400: badRequest({ "id is not a whole number": INVALID_ANNOUNCEMENT_ID }),
          404: announcementNotFound,
          500: serverError,
        },
      },
    },
    "/announcements": {
      get: {
        tags: ["Announcements (pages)"],
        operationId: "announcementsPage",
        summary: "Announcements list page (HTML)",
        description:
          "Renders an HTML page with an \"Add an announcement\" form (title and content required, " +
          "author optional) and a table of every announcement, newest first, with its title, " +
          "author and date and **View**, **Edit** and **Delete** actions. Shows a short message " +
          "when there are no announcements yet.",
        responses: {
          200: htmlResponse("HTML page with the form and the list of announcements"),
        },
      },
      post: {
        tags: ["Announcements (pages)"],
        operationId: "announcementsPageFormActions",
        summary:
          "Create or delete an announcement from the /announcements page (Server Actions, browser only)",
        description:
          "Two forms on `/announcements` submit to this URL, and Next.js runs the matching " +
          "**Server Action** from `app/announcements/actions.ts`:\n\n" +
          "- the **\"Add an announcement\"** form → `createAnnouncementAction` → " +
          "`AnnouncementController.create`. On success the form shows \"Announcement … created " +
          "with id …\" and the list refreshes; a missing title or content is shown as an error " +
          "in the form.\n" +
          "- a row's **Delete** button (after a browser confirmation) → `deleteAnnouncementAction` " +
          "→ `AnnouncementController.delete`. On success the list refreshes; if the announcement " +
          "no longer exists, \"Announcement with id … not found\" is shown next to the button.\n\n" +
          SERVER_ACTION_NOTE +
          "**To create or delete announcements from Postman or scripts, use " +
          "`POST /api/announcements` and `DELETE /api/announcements/{id}`.**",
        responses: serverActionResponses,
      },
    },
    "/announcements/{id}": {
      parameters: [announcementIdParam],
      get: {
        tags: ["Announcements (pages)"],
        operationId: "announcementPage",
        summary: "Announcement page (HTML)",
        description:
          "Renders an HTML page with one announcement's title, author, dates and full content, " +
          "an **Edit** link, a **Delete** button and a link back to the list.",
        responses: {
          200: htmlResponse("HTML page with the announcement"),
          404: htmlResponse(
            'HTML "Announcement not found" page, when no announcement has this id or the id ' +
              "isn't a whole number",
          ),
        },
      },
      post: {
        tags: ["Announcements (pages)"],
        operationId: "announcementPageDeleteAction",
        summary: "Delete the announcement from its page (Server Action, browser only)",
        description:
          "The **Delete** button on `/announcements/{id}` asks the browser for confirmation, then " +
          "submits to this URL. Next.js runs `deleteAnnouncementAction` " +
          "(`app/announcements/actions.ts`), which calls `AnnouncementController.delete`. On " +
          "success the browser is redirected to `/announcements`; if the announcement no longer " +
          "exists, \"Announcement with id … not found\" is shown next to the button.\n\n" +
          SERVER_ACTION_NOTE +
          "**To delete announcements from Postman or scripts, use `DELETE /api/announcements/{id}`.**",
        responses: serverActionResponses,
      },
    },
    "/announcements/{id}/edit": {
      parameters: [announcementIdParam],
      get: {
        tags: ["Announcements (pages)"],
        operationId: "announcementEditPage",
        summary: "Edit announcement page (HTML)",
        description:
          "Renders an HTML form with the announcement's title, content and author pre-filled.",
        responses: {
          200: htmlResponse("HTML page with the pre-filled edit form"),
          404: htmlResponse(
            'HTML "Announcement not found" page, when no announcement has this id or the id ' +
              "isn't a whole number",
          ),
        },
      },
      post: {
        tags: ["Announcements (pages)"],
        operationId: "announcementEditFormAction",
        summary: "Save the announcement edit form (Server Action, browser only)",
        description:
          "Submitting the edit form sends the request to this URL. Next.js runs " +
          "`updateAnnouncementAction` (`app/announcements/actions.ts`), which calls " +
          "`AnnouncementController.update` with `title`, `content` and `author` (`createdAt` is " +
          "kept and `updatedAt` refreshed). On success the browser is redirected to " +
          "`/announcements/{id}`; a missing title or content, or an announcement that no longer " +
          "exists, is shown as an error in the form.\n\n" +
          SERVER_ACTION_NOTE +
          "**To update announcements from Postman or scripts, use `PUT` or " +
          "`PATCH /api/announcements/{id}`.**",
        responses: serverActionResponses,
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ayman" },
          email: { type: "string", example: "ayman@example.com" },
          age: { type: "integer", minimum: 0, example: 22 },
          department: { type: "string", example: "MIS" },
        },
        additionalProperties: { type: "string" },
        description:
          "`email`, `age` (an integer) and `department` are included when they have a value; any " +
          "other (dynamic) fields, stored in the `extra` jsonb column, are included as strings.",
      },
      UserInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Ayman" },
          email: { type: "string", example: "ayman@example.com" },
          age: { type: "string", description: "A whole number (0 or more)", example: "22" },
          department: { type: "string", example: "MIS" },
        },
        additionalProperties: { type: "string" },
      },
      UserPatch: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ayman" },
          email: { type: "string", example: "ayman@example.com" },
          age: { type: "string", description: "A whole number (0 or more)", example: "23" },
          department: { type: "string", example: "MIS" },
        },
        additionalProperties: { type: "string" },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      Announcement: {
        type: "object",
        required: ["id", "title", "content", "createdAt", "updatedAt"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Alumni reunion" },
          content: { type: "string", example: "Join us on campus on 12 June 2027." },
          author: { type: "string", example: "Alumni Office" },
          createdAt: { type: "string", format: "date-time", example: "2026-10-10T09:30:00.000Z" },
          updatedAt: { type: "string", format: "date-time", example: "2026-10-10T09:30:00.000Z" },
        },
      },
      AnnouncementInput: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", example: "Alumni reunion" },
          content: { type: "string", example: "Join us on campus on 12 June 2027." },
          author: { type: "string", example: "Alumni Office" },
        },
      },
      AnnouncementPatch: {
        type: "object",
        properties: {
          title: { type: "string", example: "Alumni reunion" },
          content: { type: "string", example: "Join us on campus on 12 June 2027." },
          author: { type: "string", example: "Alumni Office" },
        },
      },
    },
  },
};
