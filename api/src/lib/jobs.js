import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

import { PrismaAdapter } from '../jobs/PrismaAdapter'
import { ProductBackorderJob } from '../jobs/ProductBackorderJob'
import { RedwoodJob } from '../jobs/RedwoodJob'

export const adapter = new PrismaAdapter({ db, logger })

RedwoodJob.config({ adapter, logger })

export const jobs = {
  productBackorder: new ProductBackorderJob(),
}
