import { db } from 'api/src/lib/db'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const WAIT_TIME = 5000
const PROCESS_NAME = `jobRunner-${process.pid}`
const MAX_JOB_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours

const findSqliteJob = async () => {
  return await db.$transaction(async (tx) => {
    // Find any jobs that should run now. Look for ones that are:
    // - have a runtAt in the past
    // - and are either not locked, or where locked more than 4 hours ago
    // - or were already locked by this exact process and never cleaned up
    // - and don't have a failedAt, meaning we have stopped retrying
    // or were locked by this process previously and so should be attempted again.
    let outstandingJobs = await tx.$queryRaw`
      SELECT id, attempts
      FROM   BackgroundJob
      WHERE (
        (
          runAt <= ${new Date()} AND (
            lockedAt IS NULL OR
            lockedAt < ${new Date(new Date() - MAX_JOB_RUNTIME)}
          ) OR lockedBy = ${PROCESS_NAME}
        ) AND failedAt IS NULL)
      ORDER BY priority ASC, runAt ASC
      LIMIT 1;`

    if (outstandingJobs.length) {
      // If one was found, lock it
      await tx.$queryRaw`
        UPDATE BackgroundJob
        SET    lockedAt = ${new Date()},
                lockedBy = ${PROCESS_NAME},
                attempts = ${outstandingJobs[0].attempts + 1}
        WHERE  id  = ${outstandingJobs[0].id};`

      // Return the full job details after locking update
      outstandingJobs = await tx.$queryRaw`
        SELECT *
        FROM   BackgroundJob
        WHERE  id = ${outstandingJobs[0].id};`
    }

    return outstandingJobs[0]
  })
}

export default async () => {
  while (true) {
    let job

    if (db._activeProvider === 'sqlite') {
      job = await findSqliteJob()
    }

    if (job) {
      console.info(`Running job ${job.id}`, job)
    }

    await delay(WAIT_TIME)
  }
}
