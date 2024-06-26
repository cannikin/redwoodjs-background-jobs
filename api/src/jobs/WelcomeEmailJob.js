import { RedwoodJob } from '@redwoodjs/jobs'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class WelcomeEmailJob extends RedwoodJob {
  static queue = 'email'

  async perform(email) {
    const wait = Math.round(Math.random() * 1000 * 2)
    this.logger.info(
      `Sending welcome email to ${email} (delaying ${wait}ms)...`
    )
    await delay(wait)
  }
}
