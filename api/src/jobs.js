import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

const { fork } = require('child_process')

const argv = yargs(hideBin(process.argv)).argv
process.title = 'rw-job-runner'

const workerCount = argv.n || argv.workers || 1
const workers = []

console.info(
  `[${process.title}]`,
  `Starting RedwoodJob Runner with ${workerCount} worker(s)...`
)

for (let i = 0; i < workerCount; i++) {
  const title = `rw-job-worker.${i}`
  const child = fork('api/dist/worker.js', ['-t', title])

  // listen for messages from the child process
  child.on('message', (message) => {
    console.log(`[${title}]`, message)
  })

  // when the child exits
  child.on('exit', (code) => {
    console.log(`[${title}] Exited with code ${code}`)
    workers.splice(workers.indexOf(child), 1)
  })

  // track our array of workers so we can send them all messages
  workers.push(child)
}

// if the parent itself receives a ctrl-c, tell each worker to gracefully exit
// once they all exit, this parent will automatically exit
process.on('SIGINT', () => {
  console.info(
    `[${process.title}]`,
    `SIGINT received, shutting down workers...`
  )
  workers.forEach((worker) => {
    worker.kill('SIGINT')
  })
})
