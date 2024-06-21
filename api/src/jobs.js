#!/usr/bin/env node

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'
loadEnvFiles()

const { fork } = require('child_process')

const argv = yargs(hideBin(process.argv))
  .usage(
    'Starts the RedwoodJob runner to process background jobs\n\nUsage: $0 <command> [options]'
  )
  .command('work', 'Start a worker and process jobs')
  .command('workoff', 'Start a worker and exit after all jobs processed')
  .command('start', 'Start workers in daemon mode', (yargs) => {
    yargs
      .option('n', {
        type: 'string',
        describe:
          'Number of workers to start OR queue:num pairs of workers to start (see examples)',
        default: '1',
      })
      .example(
        '$0 start -n 2',
        'Start the job runner with 2 workers in daemon mode'
      )
      .example(
        '$0 start -n default:2,email:1',
        'Start the job runner in daemon mode with 2 workers for the "default" queue and 1 for the "email" queue'
      )
  })
  .command('stop', 'Stop any daemonized job workers')
  .command('restart', 'Stop and start any daemonized job workers', (yargs) => {
    yargs
      .option('n', {
        type: 'string',
        describe:
          'Number of workers to start OR queue:num pairs of workers to start (see examples)',
        default: '1',
      })
      .example(
        '$0 restart -n 2',
        'Restart the job runner with 2 workers in daemon mode'
      )
      .example(
        '$0 restart -n default:2,email:1',
        'Restart the job runner in daemon mode with 2 workers for the `default` queue and 1 for the `email` queue'
      )
  })
  .command('clear', 'Clear the job queue')
  .demandCommand(1, 'You must specify a mode to start in')
  .example(
    '$0 start -n 2',
    'Start the job runner with 2 workers in daemon mode'
  )
  .example(
    '$0 start -n default:2,email:1',
    'Start the job runner in daemon mode with 2 workers for the "default" queue and 1 for the "email" queue'
  )
  .help().argv

// Are we working off a number of workers or number of named queues?
let workerCount = 1
let namedWorkers = []
if (['start', 'restart'].includes(argv._[0])) {
  if (argv.n.includes(':')) {
    const workers = argv.n.split(',')
    workers.forEach((count) => {
      const [queue, num] = count.split(':')
      for (let i = 0; i < parseInt(num); i++) {
        namedWorkers.push([queue, i])
      }
    })
    workerCount = namedWorkers.length
  } else {
    workerCount = parseInt(argv.n)
  }
}

const workers = []

// Until we figure out Redwood's logger, use console for output
const logger = console

logger.info(
  { foo: 'bar' },
  `[${process.title}] Starting RedwoodJob Runner at ${new Date().toISOString()} with ${namedWorkers.length || workerCount} worker(s)...`
)

// Create a child process for every worker
for (let i = 0; i < workerCount; i++) {
  const workerArgs = []

  // working on named queues?
  if (namedWorkers.length) {
    workerArgs.push('-q', namedWorkers[i][0])
    workerArgs.push('-i', namedWorkers[i][1])
  } else {
    workerArgs.push('-i', i)
  }
  const child = fork('api/dist/worker.js', workerArgs)

  // when the child exits
  child.on('exit', (code) => {
    logger.info(`[${process.title}] Exited with code ${code}`)
    workers.splice(workers.indexOf(child), 1)
  })

  // track our array of workers so we can send them all messages
  workers.push(child)
}

let sigtermCount = 0

// If the parent receives a ctrl-c, tell each worker to gracefully exit.
// If the parent receives a second ctrl-c, exit immediately.
process.on('SIGINT', () => {
  sigtermCount++
  let message =
    'SIGINT received: shutting down workers gracefully (press Ctrl-C again to exit immediately)...'

  if (sigtermCount > 1) {
    message = 'SIGINT received again, exiting immediately...'
  }

  logger.info(`[${process.title}]`, message)

  workers.forEach((worker) => {
    sigtermCount > 1 ? worker.kill() : worker.kill('SIGINT')
  })
})

process.title = 'rw-job-runner'
