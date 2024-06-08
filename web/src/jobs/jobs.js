// In this procedural option, you create the job as a function and then
// enqueue the name of the function and the list of arguments it takes. Not as
// clean to pass options like `wait` with this syntax:
//
//   performLater('productBackorderJob', product.id)
//
import { db } from 'src/lib/db'
import { mailer } from 'src/lib/mailer'
import { BackorderEmail } from 'src/mail/BackorderEmail'

export const productBackorderJob = async (productId) => {
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

//
//
//
//
//

// Using the jobs.productBackorder syntax, you make sure the jobs object
// contains keys with your job names and values that are instances of the
// job class. How annoying is it that you have to create the class itself and
// then also update this list of available jobs?
//
//   jobs.productBackorder.performLater(product.id)
//   jobs.productBackorder.set({ wait: 300 }).performLater(product.id)
export const jobs = {
  productBackorder: new ProductBackorderJob(),
}
