import { PrismaAdapter } from 'api/src/jobs/PrismaAdapter'
import { db } from 'api/src/lib/db'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const WAIT_TIME = 5000
const PROCESS_NAME = `jobRunner-${process.pid}`
const MAX_JOB_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours

// TODO: Create job executor class
class Executor {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.job = options?.job

    // TODO validate that everything we need to create the executor is present
  }

  log(message) {
    const { handler, args } = JSON.parse(this.job.handler)

    console.info(`[${handler}] ${message} ${this.job.id}`, {
      args: args,
    })
  }
  // Actually instantiate the job class and call `perform()` on it, passing in
  // any args
  async perform(job) {
    this.log('Started', job)

    try {
      const details = JSON.parse(this.job.handler)
      const Job = await import(`api/src/jobs/${details.handler}`)
      new Job[details.handler]().perform(...details.args)

      this.#success()
    } catch (e) {
      this.#failure(e)
    }
  }

  // Handle job success: remove from DB
  #success() {
    this.log('Complete')
    this.adapter.success(this.job)
  }

  // Handle job failure: add error to DB and retry time (or mark `failedAt`)
  #failure(error) {
    this.log('Failed')
    this.adapter.failure(this.job, error)
  }
}

class Worker {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.queue = options?.queue
    this.processName = options?.PROCESS_NAME
    this.maxRuntime = options?.MAX_JOB_RUNTIME

    // TODO: check that everything we need to create the worker is present (adapter)
  }

  async run() {
    // Trick to run forever, as the linter doesn't like `while (true)`
    for (;;) {
      const job = await this.adapter.find({
        processName: PROCESS_NAME,
        maxRuntime: MAX_JOB_RUNTIME,
      })

      if (job) {
        await new Executor({ adapter: this.adapter, job }).perform()
      }

      await delay(WAIT_TIME)
    }
  }
}

// This script simply initializes a worker that runs forever. An extended
// version of the script could start N workers in parallel that only work
// off a single queue

export default async () => {
  const queue = 'default'
  const adapter = new PrismaAdapter({ db })

  new Worker({
    adapter,
    queue,
    processName: PROCESS_NAME,
    maxRuntime: MAX_JOB_RUNTIME,
  }).run()
}
