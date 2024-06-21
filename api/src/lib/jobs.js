import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

import { PrismaAdapter } from '../jobs/PrismaAdapter'
import { ProductBackorderJob } from '../jobs/ProductBackorderJob'
import { RedwoodJob } from '../jobs/RedwoodJob'

RedwoodJob.config({
  adapter: new PrismaAdapter({ accessor: db.backgroundJob, logger }),
  logger,
})

export const jobs = {
  productBackorder: new ProductBackorderJob(),
}
