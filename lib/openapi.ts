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

const NOT_FORM_DATA = "Request body must be form-data";
const NAME_REQUIRED = '"name" is required and must be a non-empty string';

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Alumni Tracking System API",
    version: "0.1.0",
    description:
      "API for the Alumni Tracking System (YBSB3001 Web Programming). " +
      "Users are stored in memory for now and are lost when the server restarts. " +
      "The API and the HTML pages share the same data: a user created with POST /api/users " +
      "appears at /users.",
  },
  tags: [
    { name: "Health", description: "Server status" },
    { name: "API Users", description: "JSON API: create, read, update and delete users" },
    {
      name: "Users (pages)",
      description:
        "HTML pages and browser forms that list, create, edit and delete the same users as the API",
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
        description: "Returns every user added so far, or an empty array if there are none.",
        responses: {
          200: {
            description: "Array of users",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/User" } },
                example: [
                  { id: 1, name: "Ayman", email: "ayman@example.com" },
                  { id: 2, name: "Elif", department: "MIS", age: "23" },
                ],
              },
            },
          },
        },
      },
      post: {
        tags: ["API Users"],
        operationId: "createUser",
        summary: "Create a user",
        description:
          "Send form-data. Only `name` is required; every other text field you send " +
          "is stored as-is (as a string). The server assigns the `id`: an `id` field in the " +
          "body is ignored, and so are uploaded files.",
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
          }),
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
        },
      },
      put: {
        tags: ["API Users"],
        operationId: "replaceUser",
        summary: "Replace a user",
        description:
          "Replaces the whole user with the form-data sent. Fields not sent are removed. " +
          "`name` is required. The `id` never changes.",
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
          }),
          404: notFound,
        },
      },
      patch: {
        tags: ["API Users"],
        operationId: "updateUser",
        summary: "Update some fields of a user",
        description:
          "Changes only the fields sent and keeps all other fields. `name` is optional, " +
          "but can't be blank if sent.",
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
          }),
          404: notFound,
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
  },
  components: {
    schemas: {
      User: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ayman" },
        },
        additionalProperties: { type: "string" },
        description: "Any other fields sent when the user was created are included as strings.",
      },
      UserInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Ayman" },
          email: { type: "string", example: "ayman@example.com" },
          age: { type: "string", example: "22" },
          department: { type: "string", example: "MIS" },
        },
        additionalProperties: { type: "string" },
      },
      UserPatch: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ayman" },
          email: { type: "string", example: "ayman@example.com" },
          age: { type: "string", example: "23" },
          department: { type: "string", example: "MIS" },
        },
        additionalProperties: { type: "string" },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
};
