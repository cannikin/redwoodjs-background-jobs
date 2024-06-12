import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

import { PrismaAdapter } from './PrismaAdapter'
import { ProductBackorderJob } from './ProductBackorderJob'
import { RedwoodJob } from './RedwoodJob'

RedwoodJob.config({
  adapter: new PrismaAdapter({ accessor: db.backgroundJob }),
  logger,
})

export const jobs = {
  productBackorder: new ProductBackorderJob(),
}
