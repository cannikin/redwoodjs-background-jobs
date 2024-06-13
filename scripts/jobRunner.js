import { PrismaAdapter } from 'api/src/jobs/PrismaAdapter'
import { db } from 'api/src/lib/db'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const WAIT_TIME = 5000
const PROCESS_NAME = `jobRunner-${process.pid}`
const MAX_JOB_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours
const adapter = new PrismaAdapter({ db })

const log = (message, job) => {
  const { handler, args } = JSON.parse(job.handler)

  console.info(`[${handler}] ${message} ${job.id}`, {
    args: args,
  })
}

// Actually instantiate the job class and call `perform()` on it, passing in
// any args
const perform = async (job) => {
  log('Started', job)

  const details = JSON.parse(job.handler)
  const Job = await import(`api/src/jobs/${details.handler}`)
  await new Job[details.handler]().perform(...details.args)
}

// Handle job success: remove from DB
const success = async (job) => {
  log('Complete', job)
  await adapter.succeed(job)
}

// Handle job failure: add error to DB and retry time (or mark `failedAt`)
const failure = async (job, error) => {
  log('Failed', job)
  await adapter.fail(job, error)
}

export default async () => {
  // Trick to run forever, as the linter doesn't like `while (true)`
  for (;;) {
    const job = await adapter.find({
      processName: PROCESS_NAME,
      maxRuntime: MAX_JOB_RUNTIME,
    })

    if (job) {
      try {
        await perform(job)
        await success(job)
      } catch (e) {
        await failure(job, e)
      }
    }

    await delay(WAIT_TIME)
  }
}
