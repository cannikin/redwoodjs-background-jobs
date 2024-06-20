import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'
loadEnvFiles()

const argv = yargs(hideBin(process.argv)).argv

import { PrismaAdapter } from './jobs/PrismaAdapter'
import { Worker } from './jobs/Worker'
import { db } from './lib/db'

process.title = argv.t

process.on('message', (message) => {
  console.info('Message from parent:', message)
})

process.send(`Starting Worker...`)

const worker = new Worker({
  adapter: new PrismaAdapter({ db }),
  processName: process.title,
})

// run() normally loops forever, but if it does stop (because `worker.forever`
// is set to `false`, or the worker receives a SIGINT), we'll send a message and
// exit gracefully
worker.run().then(() => {
  process.send(`Shutting down`)
  process.exit(0)
})

// if the parent itself receives a ctrl-c it'll pass that to the workers.
// workers will exit gracefully by setting `forever` to `false` which will tell
// it not to pick up a new job when done with the current one
process.on('SIGINT', () => {
  process.send('SIGINT received: finishing work...')
  worker.forever = false
})
