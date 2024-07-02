import { RedwoodJob } from '@redwoodjs/jobs'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class SampleJob extends RedwoodJob {
  async perform() {
    const wait = Math.round(Math.random() * 1000 * 2)
    this.logger.info(`Sample job (delaying ${wait}ms)...`)

    await delay(wait)

    this.logger.info(`Sample job done!`)
  }
}
