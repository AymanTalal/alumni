-- 005 down: undo 005_create_applications.up.sql by removing the "applications" table
-- (and all its rows). Its indexes, foreign keys, unique rule and status check are removed together
-- with the table; the users and job_postings tables are not touched.

DROP TABLE applications;
