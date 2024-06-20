import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'
loadEnvFiles()

const argv = yargs(hideBin(process.argv)).argv

import { Executor } from './jobs/Executor'
import { PrismaAdapter } from './jobs/PrismaAdapter'
import { db } from './lib/db'

process.title = `rw-job-executor.${argv.j}`

const executor = new Executor({
  adapter: new PrismaAdapter({ db }),
  jobId: argv.j,
})

executor
  .perform()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

process.on('SIGINT', () => {
  console.info(`[${process.title}] SIGINT received: finishing work...`)
})
