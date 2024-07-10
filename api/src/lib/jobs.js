import { RedwoodJob } from '@redwoodjs/jobs'
import { PrismaAdapter } from '@redwoodjs/jobs'

import { SampleJob } from 'src/jobs/SampleJob'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

export const adapter = new PrismaAdapter({ db, logger })

RedwoodJob.config({ adapter, logger })

export const jobs = {
  sample: new SampleJob(),
}
