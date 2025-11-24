SELECT conname, contype, conrelid::regclass AS table, pg_get_constraintdef(oid) as def
FROM pg_constraint
WHERE conrelid = 'job_bookmarks'::regclass;
