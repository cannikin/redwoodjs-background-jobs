import { db } from 'src/lib/db'
import { mailer } from 'src/lib/mailer'
import { ProductBackorderEmail } from 'src/mail/ProductBackorderEmail'

import { RedwoodJob } from './RedwoodJob'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class ProductBackorderJob extends RedwoodJob {
  // static queue = 'email'
  // statis priority = 10

  async perform(productID) {
    console.info(`Job running, checking product ${productID} for backorders...`)
    await delay(2000)
    // const product = await db.product.findUnique({ where: { id: productID } })

    // if (product.inventoryCount > 0) {
    //   const waitList = await db.waitlist.findMany({
    //     where: { productId: product.id },
    //   })

    //   const sent = []

    //   for (const user of waitList) {
    //     sent.push(
    //       await mailer.send(ProductBackorderEmail({ product }), {
    //         to: user.email,
    //         subject: `Product Back in Stock: ${product.name}`,
    //       })
    //     )
    //     await db.waitlist.delete({
    //       where: { productId: product.id, email: user.email },
    //     })
    //   }

    //   console.log(`[ProductBackorderJob]: Sent ${sent.length} waitlist emails`)
    // }
  }
}
