#!/usr/bin/env node

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'
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
  .help().argv

console.info(argv)

import { PrismaAdapter } from './jobs/PrismaAdapter'
import { Worker } from './jobs/Worker'
import { db } from './lib/db'

const TITLE_PREFIX = `rw-job-worker`

// TODO figure out Redwood logger
const logger = console

// set the process title
let title = TITLE_PREFIX
if (argv.q) {
  title += `.${argv.q}.${argv.i}`
} else {
  title += `.${argv.i}`
}
process.title = title

logger.info(`[${process.title}] Starting Worker...`)

const worker = new Worker({
  adapter: new PrismaAdapter({ db }),
  processName: process.title,
  logger,
})

// run() normally loops forever, but if it does stop (because `worker.forever`
// is set to `false`, or the worker receives a SIGINT), we'll send a message and
// exit gracefully
worker.run().then(() => {
  logger.info(`[${process.title}] Worker finished, shutting down.`)
  process.exit(0)
})

// watch for signals from the parent

// if the parent itself receives a ctrl-c it'll pass that to the workers.
// workers will exit gracefully by setting `forever` to `false` which will tell
// it not to pick up a new job when done with the current one
process.on('SIGINT', () => {
  logger.info(`[${process.title}] SIGINT received, finishing work...`)
  worker.forever = false
})

// if the parent itself receives a ctrl-c more than once it'll send SIGTERM
// instead in which case we exit immediately no matter what state the worker is
// in
process.on('SIGTERM', () => {
  logger.info(`[${process.title}] SIGTERM received, exiting now!`)
  process.exit(0)
})
