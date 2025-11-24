SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('imported_jobs','job_bookmarks');
SELECT count(*) as imported_count FROM imported_jobs;
SELECT count(*) as bookmarks_count FROM job_bookmarks;
