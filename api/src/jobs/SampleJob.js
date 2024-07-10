import { RedwoodJob } from '@redwoodjs/jobs'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class SampleJob extends RedwoodJob {
  async perform(randNum) {
    const wait = Math.round(Math.random() * 1000 * 2)
    this.logger.info(`Sample job with ${randNum} (delaying ${wait}ms)...`)

    await delay(wait)

    this.logger.info(`Sample job done!`)
  }
}
