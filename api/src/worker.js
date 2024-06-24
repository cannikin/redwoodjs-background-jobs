#!/usr/bin/env node

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'

import { PrismaAdapter } from './jobs/PrismaAdapter'
import { Worker } from './jobs/Worker'
import { db } from './lib/db'
import { logger } from './lib/logger.js'

loadEnvFiles()

const argv = yargs(hideBin(process.argv))
  .usage(
    'Starts a single RedwoodJob worker to process background jobs\n\nUsage: $0 [options]'
  )
  .option('i', {
    alias: 'id',
    type: 'number',
    description: 'The worker ID',
    demandOption: true,
  })
  .option('q', {
    alias: 'queue',
    type: 'string',
    description: 'The named queue to work on',
  })
  .option('o', {
    alias: 'workoff',
    type: 'boolean',
    default: false,
    description: 'Work off all jobs in the queue and exit',
  })
  .help().argv

const TITLE_PREFIX = `rw-job-worker`

// set the process title
let title = TITLE_PREFIX
if (argv.q) {
  title += `.${argv.queue}.${argv.id}`
} else {
  title += `.${argv.id}`
}
process.title = title

logger.info(
  { worker: process.title },
  `Starting work at ${new Date().toISOString()}...`
)

const worker = new Worker({
  adapter: new PrismaAdapter({ db }),
  processName: process.title,
  logger,
  queue: argv.queue,
  workoff: argv.workoff,
})

// run() normally loops forever, but if it does stop (because `worker.forever`
// is set to `false`, or the worker receives a SIGINT), we'll send a message and
// exit gracefully
worker.run().then(() => {
  logger.info({ worker: process.title }, `Worker finished, shutting down.`)
  process.exit(0)
})

// watch for signals from the parent

// if the parent itself receives a ctrl-c it'll pass that to the workers.
// workers will exit gracefully by setting `forever` to `false` which will tell
// it not to pick up a new job when done with the current one
process.on('SIGINT', () => {
  logger.info({ worker: process.title }, `SIGINT received, finishing work...`)
  worker.forever = false
})

// if the parent itself receives a ctrl-c more than once it'll send SIGTERM
// instead in which case we exit immediately no matter what state the worker is
// in
process.on('SIGTERM', () => {
  logger.info({ worker: process.title }, `SIGTERM received, exiting now!`)
  process.exit(0)
})
