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

const NOT_FORM_DATA = "Request body must be form-data";
const NAME_REQUIRED = '"name" is required and must be a non-empty string';

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Alumni Tracking System API",
    version: "0.1.0",
    description:
      "API for the Alumni Tracking System (YBSB3001 Web Programming). " +
      "Users are stored in memory for now and are lost when the server restarts.",
  },
  tags: [
    { name: "Health", description: "Server status" },
    { name: "Users", description: "Create, read, update and delete users" },
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
        tags: ["Users"],
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
        tags: ["Users"],
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
        tags: ["Users"],
        operationId: "getUser",
        summary: "Get one user",
        responses: {
          200: userResponse("The user", { id: 1, name: "Ayman", email: "ayman@example.com" }),
          404: notFound,
        },
      },
      put: {
        tags: ["Users"],
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
        tags: ["Users"],
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
        tags: ["Users"],
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
