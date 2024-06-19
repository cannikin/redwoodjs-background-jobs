import { DEFAULT_QUEUE } from 'api/src/jobs/RedwoodJob'

import { Executor } from './Executor'

const DEFAULT_WAIT_TIME = 5000
const DEFAULT_MAX_RUNTIME = 5000

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class Worker {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.queue = options?.queue || DEFAULT_QUEUE
    this.processName = options?.processName || `runner-${process.pid}`
    this.maxRuntime = options?.MAX_JOB_RUNTIME || DEFAULT_MAX_RUNTIME
    this.waitTime = options?.waitTime || DEFAULT_WAIT_TIME
    this.lastCheckTime = new Date()
    // TODO: check that everything we need to create the worker is present (adapter)
  }

  async run() {
    // Trick to run forever, as the linter doesn't like `while (true)`
    for (;;) {
      this.lastCheckTime = new Date()

      const job = await this.adapter.find({
        processName: this.processName,
        maxRuntime: this.maxRuntime,
      })

      if (job) {
        await new Executor({ adapter: this.adapter, job }).perform()
      }

      // Check if we need to wait before checking for another job
      const millsSinceLastCheck = new Date() - this.lastCheckTime
      console.info('millis since last check:', millsSinceLastCheck)
      if (millsSinceLastCheck < this.waitTime) {
        await delay(this.waitTime - millsSinceLastCheck)
      }
    }
  }
}
