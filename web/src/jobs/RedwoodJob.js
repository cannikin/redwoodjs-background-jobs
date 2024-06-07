export class RedwoodJob {
  static queue = 'default'

  // Called automatically by .set or .performLater
  constructor(options) {
    this.options = options
  }

  // Schedules a job with the appropriate adapter, returns the details that for
  // the job that was scheduled
  schedule(args) {
    // TODO: Actually schedule the job with the adapter

    return {
      handler: args[0],
      arguments: args.slice(1),
      runAt: this.runAt,
      queue: this.queue,
    }
  }

  // Called as an instance method:
  //   RedwoodJob.set({ wait: 300 }).performLater('JobClassName', 'arg1', 'arg2')
  performLater(...args) {
    return this.schedule(args)
  }

  // Called as a class method:
  //   RedwoodJob.performLater('JobClassName', 'arg1', 'arg2')
  static performLater = async (...args) => {
    return new this().schedule(args)
  }

  // Set options on the job before enqueueing it:
  //   const job = RedwoodJob.set({ wait: 300 })
  //   job.performLater('JobClassName', 'arg1', 'arg2')
  static set = (options) => {
    return new this({ queue: this.queue, ...options })
  }

  // Determines the name of the queue
  get queue() {
    return this.options?.queue || RedwoodJob.queue
  }

  // Determines when the job should run. If no options, runs as soon as possible
  // Otherwise, can set the number of seconds to wait with `wait` or a run at
  // a specific time with `waitUntil`
  get runAt() {
    return this.options?.wait
      ? new Date(new Date() + this.options.wait * 1000)
      : this.options?.waitUntil
        ? this.options.waitUntil
        : new Date()
  }

  // Must be implemented by the subclass
  perform() {
    throw new Error('You must implement the `perform` method in your job class')
  }
}
