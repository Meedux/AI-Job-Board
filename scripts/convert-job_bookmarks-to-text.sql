-- Convert job_bookmarks uuid columns to text to match existing jobs.id and users.id which are text
ALTER TABLE job_bookmarks ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE job_bookmarks ALTER COLUMN job_id TYPE text USING job_id::text;
ALTER TABLE job_bookmarks ALTER COLUMN user_id TYPE text USING user_id::text;
