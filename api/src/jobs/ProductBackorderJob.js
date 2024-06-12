import { db } from 'src/lib/db'

import { RedwoodJob } from './RedwoodJob'

export class ProductBackorderJob extends RedwoodJob {
  // static queue = 'notifications'

  async perform(productID) {
    throw new Error('Could not backorder product')
  }
}
