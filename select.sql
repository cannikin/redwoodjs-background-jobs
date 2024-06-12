---------------
-- SQLite
---------------

-- Find jobs that need to run

SELECT "delayed_jobs".*
FROM "delayed_jobs"
WHERE (
  (
    run_at <= '2024-06-11 22:09:09.423385' AND (
      locked_at IS NULL OR locked_at < '2024-06-11 18:09:09.423389'
    ) OR locked_by = 'host:trion.local pid:32115'
  )
  AND failed_at IS NULL
)
ORDER BY priority ASC, run_at ASC
LIMIT 5

-- Lock them for this worker. Not sure why it does all this on just a specific job ID

UPDATE "delayed_jobs"
SET    "locked_at" = '2024-06-11 22:09:09.423565',
       "locked_by" = 'host:trion.local pid:32115'
WHERE "delayed_jobs"."id" IN (
  SELECT "delayed_jobs"."id"
  FROM "delayed_jobs"
  WHERE (
    (
      run_at <= '2024-06-11 22:09:09.423385' AND (
        locked_at IS NULL OR
        locked_at < '2024-06-11 18:09:09.423389'
      ) OR locked_by = 'host:trion.local pid:32115'
    ) AND failed_at IS NULL
  ) AND "delayed_jobs"."id" = 74
  ORDER BY priority ASC, run_at ASC
)

-- Get the details for the job

SELECT "delayed_jobs".*
FROM "delayed_jobs"
WHERE "delayed_jobs"."id" = 74
LIMIT 1



---------------
-- MySQL
---------------

-- Attempt to claim any jobs that need to run

UPDATE `delayed_jobs`
SET    `delayed_jobs`.`locked_at` = '2024-06-11 22:15:07',
       `delayed_jobs`.`locked_by` = 'delayed_job.3 host:ip-172-31-69-95 pid:24356'
WHERE (
  (
    run_at <= '2024-06-11 22:15:07.757796' AND (
      locked_at IS NULL OR
      locked_at < '2024-06-11 18:15:07.757812'
    ) OR locked_by = 'delayed_job.3 host:ip-172-31-69-95 pid:24356'
  ) AND failed_at IS NULL
)
ORDER BY priority ASC, run_at ASC
LIMIT 1


-- Find jobs that the worker just locked

SELECT   `delayed_jobs`.*
FROM     `delayed_jobs`
WHERE    `delayed_jobs`.`locked_at` = '2024-06-11 22:23:20' AND
         `delayed_jobs`.`locked_by` = 'delayed_job.2 host:ip-172-31-69-95 pid:24351' AND
         `delayed_jobs`.`failed_at` IS NULL
ORDER BY `delayed_jobs`.`id` ASC
LIMIT    1
