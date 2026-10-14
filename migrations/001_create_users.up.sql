-- 001 up: create the "users" table.
-- Follows the proposed design in ddd.md ("Proposed database design" → users).

CREATE TABLE users (
  -- Auto-increment id, never reused (same as the in-memory Model, but it keeps counting across restarts).
  -- Open question 3 in ddd.md (numeric ids or UUIDs): using the proposal, numeric bigint ids.
  id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Required and not blank: the same rule as UserController.validateName.
  name       text        NOT NULL CHECK (btrim(name) <> ''),

  -- Open question 6 in ddd.md (unique? format check?): using the proposal, nullable with no constraint.
  email      text,

  -- Open question 5 in ddd.md (should age become a number?): using the proposal, an integer >= 0.
  -- (The in-memory app stores age as text, e.g. "22"; the app must convert it when it starts using this table.)
  age        integer     CHECK (age >= 0),

  department text,

  -- Open question 4 in ddd.md (dynamic user fields): using the recommended option 3, fixed columns above
  -- plus this jsonb column for every other field the API accepts, e.g. {"city": "Istanbul"}.
  extra      jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- Open question 7 in ddd.md (timestamps for users?): using the proposal, yes.
  -- updated_at is not changed automatically (no trigger): the app sets updated_at = now() in its UPDATE queries.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
