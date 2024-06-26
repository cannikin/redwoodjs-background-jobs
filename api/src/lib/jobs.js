import { RedwoodJob } from '@redwoodjs/jobs'
import { PrismaAdapter } from '@redwoodjs/jobs'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

import { ProductBackorderJob } from '../jobs/Product/ProductBackorderJob'
import { WelcomeEmailJob } from '../jobs/WelcomeEmailJob'

export const adapter = new PrismaAdapter({ db, logger })

RedwoodJob.config({ adapter, logger })

export const jobs = {
  productBackorder: new ProductBackorderJob(),
  welcomeEmail: new WelcomeEmailJob(),
}
