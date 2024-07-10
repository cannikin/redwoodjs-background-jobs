import { RedwoodJob } from '@redwoodjs/jobs'

import { mailer } from 'src/lib/mailer'
import { WelcomeEmail } from 'src/mail/WelcomeEmail'

export class WelcomeJob extends RedwoodJob {
  async perform(userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    await mailer.send(WelcomeEmail({ user }), {
      to: user.email,
      subject: `Welcome to the site!`,
    })
  }
}
