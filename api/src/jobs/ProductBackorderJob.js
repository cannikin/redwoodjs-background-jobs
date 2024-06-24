import { RedwoodJob } from './RedwoodJob'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class ProductBackorderJob extends RedwoodJob {
  async perform(productID) {
    const wait = Math.round(Math.random() * 1000 * 2)
    this.logger.info(
      `Checking product ${productID} for backorders (delaying ${wait}ms)...`
    )
    await delay(wait)
    this.logger.info(`Emails sent!`)
  }
}

// Actual sample job implementation that sends an email to users on a waitlist
//
// import { db } from 'src/lib/db'
// import { mailer } from 'src/lib/mailer'
// import { ProductBackorderEmail } from 'src/mail/ProductBackorderEmail'
//
// export class ProductBackorderJob extends RedwoodJob {
//   async perform(productID) {
//
//    const product = await db.product.findUnique({ where: { id: productID } })
//
//    if (product.inventoryCount > 0) {
//      const waitList = await db.waitlist.findMany({
//        where: { productId: product.id },
//      })
//
//      const sent = []
//
//      for (const user of waitList) {
//        sent.push(
//          await mailer.send(ProductBackorderEmail({ product }), {
//            to: user.email,
//            subject: `Product Back in Stock: ${product.name}`,
//          })
//        )
//        await db.waitlist.delete({
//          where: { productId: product.id, email: user.email },
//        })
//      }
//   }
// }
