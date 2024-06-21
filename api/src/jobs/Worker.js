// Used by the job runner to find the next job to run and invoke the Executor

import { DEFAULT_QUEUE } from 'src/jobs/RedwoodJob'

import { AdapterRequiredError } from './errors'
import { Executor } from './Executor'

export const DEFAULT_WAIT_TIME = 5000 // 5 seconds
export const DEFAULT_MAX_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours
export const DEFAULT_PROCESS_NAME_PREFIX = 'rw-job-worker'

export class Worker {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.queue = options?.queue || DEFAULT_QUEUE
    this.logger = options?.logger || console
    this.processName =
      options?.processName || `${DEFAULT_PROCESS_NAME_PREFIX}.${process.pid}`

    // the maximum amount of time to let a job run
    this.maxRuntime =
      options?.maxRuntime === undefined
        ? DEFAULT_MAX_RUNTIME
        : options.maxRuntime

    // the amount of time to wait between checking for jobs. the time it took
    // to run a job is subtracted from this time, so this is a maximum wait time
    this.waitTime =
      options?.waitTime === undefined ? DEFAULT_WAIT_TIME : options.waitTime

    // keep track of the last time we checked for jobs
    this.lastCheckTime = new Date()

    // Set to `false` if the work loop should only run one time, regardless
    // of how many outstanding jobs there are to be worked on. The worker
    // process will set this to `false` as soon as the user hits ctrl-c so
    // any current job will complete before exiting.
    this.forever = options?.forever === undefined ? true : options.forever

    // Set to `true` if the work loop should run through all *available* jobs
    // and then quit. Serves a slightly different purpose than `forever` which
    // makes the runner exit immediately after the next loop, where as `workoff`
    // doesn't exit the loop until there are no more jobs to work on.
    this.workoff = options?.workoff === undefined ? false : options.workoff

    if (!this.adapter) throw new AdapterRequiredError()
  }

  // Workers run forever unless:
  // `this.forever` to false (loop only runs once, then exits)
  // `this.workoff` is true (run all jobs in the queue, then exits)
  async run() {
    do {
      this.lastCheckTime = new Date()

      this.logger.debug(`[${this.processName}] Checking for jobs...`)

      const job = await this.adapter.find({
        processName: this.processName,
        maxRuntime: this.maxRuntime,
        queue: this.queue,
      })

      if (job) {
        // TODO add timeout handling if runs for more than `this.maxRuntime`
        await new Executor({
          adapter: this.adapter,
          job,
          logger: this.logger,
        }).perform()
      } else if (this.workoff) {
        // If there are no jobs and we're in workoff mode, we're done
        break
      }

      // sleep if there were no jobs found, otherwise get back to work
      if (!job && this.forever) {
        const millsSinceLastCheck = new Date() - this.lastCheckTime
        if (millsSinceLastCheck < this.waitTime) {
          await this.#wait(this.waitTime - millsSinceLastCheck)
        }
      }
    } while (this.forever)
  }

  #wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
