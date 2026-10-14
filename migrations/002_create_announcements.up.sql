-- 002 up: create the "announcements" table.
-- Follows the proposed design in ddd.md ("Proposed database design" → announcements).

CREATE TABLE announcements (
  -- Auto-increment id, never reused (numeric, like users; open question 3 in ddd.md).
  id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Required and not blank: the same rules as AnnouncementController.validateAnnouncement.
  title      text        NOT NULL CHECK (btrim(title) <> ''),
  content    text        NOT NULL CHECK (btrim(content) <> ''),

  -- Open question 2 in ddd.md (should author reference a user?): using Option A, which matches today,
  -- author stays free text with no link to users. (Option B, an author_id → users(id) column, is not used.)
  author     text,

  -- updated_at is not changed automatically (no trigger): the app sets updated_at = now() in its UPDATE queries,
  -- like the in-memory Model refreshes updatedAt today.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Supports listing announcements newest first, like getAllAnnouncements() does today.
CREATE INDEX announcements_created_at_idx ON announcements (created_at DESC);
