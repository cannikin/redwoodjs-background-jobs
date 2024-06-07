import { db } from 'src/lib/db'
import { mailer } from 'src/lib/mailer'
import { BackorderEmail } from 'src/mail/BackorderEmail'

import { RedwoodJob } from './RedwoodJob'

export class ProductBackorderJob extends RedwoodJob {
  // static queue = 'notifications'

  async perform(productID) {
    const subscribers = await db.backorderSubscribers.findMany({
      where: { productId },
    })

    for (const subscriber of subscribers) {
      await mailer.send(
        BackorderEmail({
          to: subscriber.email,
          subject: 'Product Back in Stock',
          body: `The product you were interested in is back in stock!`,
        })
      )
    }
  }
}
