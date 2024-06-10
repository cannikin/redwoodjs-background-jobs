import { db } from 'src/lib/db'

import { RedwoodJob } from './RedwoodJob'

export class ProductBackorderJob extends RedwoodJob {
  // static queue = 'notifications'

  async perform(productID) {
    // TODO Make a fake jobs
  }
}
