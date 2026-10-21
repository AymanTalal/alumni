-- 004 down: undo 004_drop_job_postings_user_id.up.sql by adding the owner column back.
--
-- The old owner values can't be restored (up deleted them), so the column comes back EMPTY and
-- NULLABLE: existing postings would break a NOT NULL rule. The foreign key keeps the same
-- ON DELETE CASCADE rule as migration 003, and its index is re-created with the same name.
ALTER TABLE job_postings
  ADD COLUMN user_id bigint REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX job_postings_user_id_idx ON job_postings (user_id);
