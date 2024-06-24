#!/usr/bin/env node

import { fork } from 'node:child_process'

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { loadEnvFiles } from '@redwoodjs/cli/dist/lib/loadEnvFiles'

import { logger } from './lib/logger.js'
loadEnvFiles()

process.title = 'rw-job-runner'

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

const command = argv._[0]
const shouldDetachWorkers = ['start', 'restart'].includes(command)

// Builds up an array of arrays, with queue name and id:
//   `-n default:2,email:1` => [ ['default', 0], ['default', 1], ['email', 0] ]
// If only given a number of workers then queue name is an empty string:
//   `-n 2` => [ ['', 0], ['', 1] ]
let workers = []

// default to one worker for commands that don't specify
if (!argv.n) {
  argv.n = '1'
}

// if only a number was given, convert it to a nameless worker: `2` => `:2`
if (!isNaN(parseInt(argv.n))) {
  argv.n = `:${argv.n}`
}

// split the queue:num pairs and build the workers array
argv.n.split(',').forEach((count) => {
  const [queue, num] = count.split(':')
  for (let i = 0; i < parseInt(num); i++) {
    workers.push([queue || null, i])
  }
})

const children = []

// Until we figure out Redwood's logger, use console for output
// const logger = console

logger.warn(
  `Starting RedwoodJob Runner at ${new Date().toISOString()} with ${workers.length} worker(s)...`
)

// Create a child process for every worker
workers.forEach(([queue, id], i) => {
  // list of args to send to the forked worker script
  const workerArgs = ['-i', id]

  // add the queue name if present
  if (queue) {
    workerArgs.push('-q', queue)
  }

  // are we in workoff mode?
  if (argv._[0] === 'workoff') {
    workerArgs.push('-o')
  }

  // fork the worker process
  const child = fork('api/dist/worker.js', workerArgs, {
    detached: shouldDetachWorkers,
    stdio: shouldDetachWorkers ? 'ignore' : 'inherit',
  })

  if (shouldDetachWorkers) {
    child.unref()
  } else {
    // children stay attached so watch for their exit
    child.on('exit', (code) => {
      logger.info(`[${process.title}] Exited with code ${code}`)
      children.splice(children.indexOf(child), 1)
    })

    // track our array of workers so we can send them all messages
    children.push(child)
  }
})

// We're running in start or restart mode, so just exit this parent process
if (shouldDetachWorkers) {
  logger.warn(
    `Workers detached, exiting parent process at ${new Date().toISOString()}.`
  )
  process.exit(0)
}

// if we get here then we're still monitoring children and have to pass on signals
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

  logger.info(message)

  children.forEach((worker) => {
    sigtermCount > 1 ? worker.kill() : worker.kill('SIGINT')
  })
})
