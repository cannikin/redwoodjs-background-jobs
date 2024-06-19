import { PrismaAdapter } from 'api/src/jobs/PrismaAdapter'
import { db } from 'api/src/lib/db'

import { Worker } from './Worker'

export default async () => {
  new Worker({ adapter: new PrismaAdapter({ db }) }).run()
}
