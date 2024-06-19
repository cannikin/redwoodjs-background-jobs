import { DEFAULT_QUEUE } from 'src/jobs/RedwoodJob'

import { AdapterRequiredError } from './errors'
import { Executor } from './Executor'

export const DEFAULT_WAIT_TIME = 5000 // 5 seconds
export const DEFAULT_MAX_RUNTIME = 60 * 60 * 4 * 1000 // 4 hours

export class Worker {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.queue = options?.queue || DEFAULT_QUEUE
    this.processName = options?.processName || `runner-${process.pid}`
    this.maxRuntime =
      options?.maxRuntime === undefined
        ? DEFAULT_MAX_RUNTIME
        : options.maxRuntime
    this.waitTime =
      options?.waitTime === undefined ? DEFAULT_WAIT_TIME : options.waitTime
    this.lastCheckTime = new Date()

    // Mainly for testing: set to `false` so the run() loop only runs once
    this.forever = options?.forever === undefined ? true : options.forever

    if (!this.adapter) throw new AdapterRequiredError()
  }

  async run() {
    // Workers run forever unless setting `this.forever` to false (like for tests)
    do {
      this.lastCheckTime = new Date()

      const job = await this.adapter.find({
        processName: this.processName,
        maxRuntime: this.maxRuntime,
      })

      if (job) {
        await new Executor({ adapter: this.adapter, job }).perform()
      }

      // if we're looping forever, wait a bit before checking for more jobs
      if (this.forever) {
        const millsSinceLastCheck = new Date() - this.lastCheckTime
        console.info('lastCheckTime', this.lastCheckTime)
        console.info('millsSinceLastCheck', millsSinceLastCheck)
        if (millsSinceLastCheck < this.waitTime) {
          console.info('going to wait', this.waitTime - millsSinceLastCheck)
          await this.#wait(this.waitTime - millsSinceLastCheck)
        }
      }
    } while (this.forever)
  }

  #wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
