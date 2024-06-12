import { db } from 'src/lib/db'
import { mailer } from 'src/lib/mailer'
import { ProductBackorderEmail } from 'src/mail/ProductBackorderEmail'

import { RedwoodJob } from './RedwoodJob'

export class ProductBackorderJob extends RedwoodJob {
  // static queue = 'notifications'
  // statis priority = 10

  async perform(productID) {
    const product = await db.product.findUnique({ where: { id: productID } })

    if (product.inventoryCount > 0) {
      const waitList = await db.waitlist.findMany({
        where: { productId: productID },
      })

      for (const person of waitList) {
        await mailer.send(ProductBackorderEmail({ product }), {
          to: person.email,
          subject: `Product Back in Stock: ${product.name}`,
        })
      }
    }
    console.log(`ProductBackorderJob: Product ${productID} is backordered`)
  }
}
