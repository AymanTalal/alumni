-- 004 up: remove the owner column job_postings.user_id.
-- Follows the design change in ddd.md (the professor's whiteboard design): users and job postings
-- are linked ONLY through the applications join table (many-to-many), so a job posting has no owner.
-- Migration 003 is not edited (a new file, never edit an old one).
--
-- WARNING: this permanently loses who created each existing job posting. The postings themselves
-- (id, title, company, timestamps) are kept; only the owner information is gone.

-- The foreign key and the index created by migration 003 would also disappear with the column,
-- but they are dropped explicitly first, so it's clear nothing is left behind.
ALTER TABLE job_postings DROP CONSTRAINT job_postings_user_id_fkey;
DROP INDEX job_postings_user_id_idx;

ALTER TABLE job_postings DROP COLUMN user_id;
