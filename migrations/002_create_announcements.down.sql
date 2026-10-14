-- 002 down: undo 002_create_announcements.up.sql by removing the "announcements" table
-- (and all its rows). Its index is removed together with the table.

DROP TABLE announcements;
