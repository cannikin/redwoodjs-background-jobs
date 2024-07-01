import { RedwoodJob } from '@redwoodjs/jobs'
import { PrismaAdapter } from '@redwoodjs/jobs'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

import { SampleJob } from '../jobs/SampleJob'

export const adapter = new PrismaAdapter({ db, logger })

RedwoodJob.config({ adapter: adapter, logger })

export const jobs = {
  sampleJob: new SampleJob(),
}
