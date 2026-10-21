-- 005 up: create the "applications" table.
-- Follows the design in ddd.md ("applications"): the join table that links users and job postings
-- (many-to-many). One row is one user's application to one job posting; a user can apply to many
-- postings, and a posting can have many applicants.

CREATE TABLE applications (
  -- Auto-increment id, never reused (numeric, like the other tables).
  id             bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Foreign key to the applicant (same type as users.id). NOT NULL, and PostgreSQL rejects a
  -- user_id that doesn't exist. ON DELETE CASCADE (ddd.md, question 18): deleting a user also
  -- deletes their applications.
  user_id        bigint      NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  -- Foreign key to the job posting applied to (same type as job_postings.id). NOT NULL, and
  -- PostgreSQL rejects a job_posting_id that doesn't exist. ON DELETE CASCADE: deleting a posting
  -- also deletes its applications.
  job_posting_id bigint      NOT NULL REFERENCES job_postings (id) ON DELETE CASCADE,

  -- Where the application stands. A new application is 'pending'; any other value is rejected.
  status         text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'accepted', 'rejected')),

  -- updated_at is not changed automatically (no trigger): the app will set updated_at = now()
  -- in its UPDATE queries, like it does for the other tables.
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  -- One application per user and posting: applying twice is rejected (unique violation 23505,
  -- which the API will answer with 409 Conflict).
  CONSTRAINT applications_user_id_job_posting_id_key UNIQUE (user_id, job_posting_id)
);

-- PostgreSQL indexes the primary key but not foreign keys. These indexes make "all applications of
-- a user" and "all applicants of a posting" fast, and let ON DELETE CASCADE find the rows quickly.
CREATE INDEX applications_user_id_idx ON applications (user_id);
CREATE INDEX applications_job_posting_id_idx ON applications (job_posting_id);
