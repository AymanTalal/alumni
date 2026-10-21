-- 003 down: undo 003_create_job_postings.up.sql by removing the "job_postings" table
-- (and all its rows). Its index and foreign key are removed together with the table;
-- the users table is not touched.

DROP TABLE job_postings;
