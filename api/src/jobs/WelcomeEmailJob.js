import { RedwoodJob } from '@redwoodjs/jobs'
import { PrismaAdapter } from '@redwoodjs/jobs'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class WelcomeEmailJob extends RedwoodJob {
  static queue = 'email'
  static adapter = new PrismaAdapter({ db, logger })

  async perform(email) {
    const wait = Math.round(Math.random() * 1000 * 2)
    this.logger.info(
      `Sending welcome email to ${email} (delaying ${wait}ms)...`
    )
    await delay(wait)
  }
}
