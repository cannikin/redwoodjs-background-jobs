import { execSync } from 'child_process'

import { DEFAULT_QUEUE } from 'src/jobs/RedwoodJob'

import { AdapterRequiredError } from './errors'

export const DEFAULT_WAIT_TIME = 5000 // 5 seconds
export const DEFAULT_MAX_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours

export class Worker {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.queue = options?.queue || DEFAULT_QUEUE
    this.processName = options?.processName || `rw-job-worker.${process.pid}`

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

    // Mainly for testing: set to `false` so the run() loop only runs once
    this.forever = options?.forever === undefined ? true : options.forever

    if (!this.adapter) throw new AdapterRequiredError()
  }

  async run() {
    do {
      this.lastCheckTime = new Date()

      const job = await this.adapter.find({
        processName: this.processName,
        maxRuntime: this.maxRuntime,
      })

      if (job) {
        try {
          execSync(`node api/dist/executor.js -j ${job.id}`, {
            timeout: this.maxRuntime,
            stdio: 'inherit',
          })
        } catch (e) {
          if (e.message.match(/ETIMEDOUT/)) {
            console.error('Job timed out')
          } else {
            throw e
          }
        }
      }

      // TODO only delay if there are zero jobs available
      // if we're looping forever, wait a bit before checking for more jobs
      if (this.forever) {
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
