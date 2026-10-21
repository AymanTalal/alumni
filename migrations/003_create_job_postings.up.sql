-- 003 up: create the "job_postings" table.
-- Follows the design in ddd.md ("job_postings"): one user has many job postings,
-- and each posting belongs to exactly one user.

CREATE TABLE job_postings (
  -- Auto-increment id, never reused (numeric, like users and announcements).
  id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Foreign key to the user who posted the job (same type as users.id). NOT NULL: every posting
  -- belongs to exactly one user, and PostgreSQL rejects a user_id that doesn't exist.
  -- ON DELETE CASCADE (the decision recorded in ddd.md, question 11): deleting a user also deletes
  -- all of their job postings, so a posting is never left without its user.
  user_id    bigint      NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  -- Required and not blank: the same rule style as announcements.title.
  title      text        NOT NULL CHECK (btrim(title) <> ''),

  -- Optional (open question 13 in ddd.md: should company be required?).
  company    text,

  -- updated_at is not changed automatically (no trigger): the app will set updated_at = now()
  -- in its UPDATE queries, like it does for users and announcements.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PostgreSQL indexes the primary key but not the foreign key. This index makes looking up one
-- user's postings fast, and lets the ON DELETE CASCADE find a deleted user's postings quickly.
CREATE INDEX job_postings_user_id_idx ON job_postings (user_id);
