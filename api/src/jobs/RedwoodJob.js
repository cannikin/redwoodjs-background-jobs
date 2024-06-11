// Base class for all jobs, providing a common interface for scheduling jobs.
// At a minimum, you must implement the `perform` method in your job.

import { AdapterNotConfiguredError, PerformNotImplementedError } from './errors'

export class RedwoodJob {
  // The default queue for all jobs
  static queue = 'default'

  // The default priority for all jobs
  // Assumes a range of 1 - 100, 1 being highest priority
  static priority = 50

  // The adapter to use for scheduling jobs
  static adapter

  // Configure all jobs to use a specific adapter
  static config(options) {
    if (options && Object.keys(options).includes('adapter')) {
      this.adapter = options.adapter
    }
  }

  // Class method to schedule a job to run later
  //   const scheduleDetails = RedwoodJob.performLater('foo', 'bar')
  static performLater(...args) {
    return new this().#schedule(args)
  }

  // Class method to run the job immediately in the current process
  //   const result = RedwoodJob.performNow('foo', 'bar')
  static performNow(...args) {
    return new this().performNow(...args)
  }

  // Set options on the job before enqueueing it:
  //   const job = RedwoodJob.set({ wait: 300 })
  //   job.performLater('foo', 'bar')
  static set(options) {
    return new this({ queue: this.queue, priority: this.priority, ...options })
  }

  // A job can be instantiated manually, but this will also be invoked
  // automatically by .set() or .performLater()
  constructor(options) {
    this.options = options
  }

  // Instance method to schedule a job to run later
  //   const job = RedwoodJob
  //   const scheduleDetails = job.performLater('foo', 'bar')
  performLater(...args) {
    return this.#schedule(args)
  }

  // Instance method to runs the job immediately in the current process
  //   const result = RedwoodJob.performNow('foo', 'bar')
  performNow(...args) {
    return this.perform(...args)
  }

  // Must be implemented by the subclass
  perform() {
    throw new PerformNotImplementedError()
  }

  // Determines the name of the queue
  get queue() {
    return this.options?.queue || this.constructor.queue
  }

  // Set the name of the queue directly on an instance of a job
  set queue(value) {
    this.options = Object.assign(this.options || {}, { queue: value })
  }

  // Determines the priority of the job
  get priority() {
    return this.options?.priority || this.constructor.priority
  }

  set priority(value) {
    this.options = Object.assign(this.options || {}, {
      priority: value,
    })
  }

  // Determines when the job should run. If no options, runs as soon as possible
  // Otherwise, can set the number of seconds to wait with `wait` or a run at
  // a specific time with `waitUntil`.
  get runAt() {
    if (!this.options?.runAt) {
      this.options = Object.assign(this.options || {}, {
        runAt: this.options?.wait
          ? new Date(new Date() + this.options.wait * 1000)
          : this.options?.waitUntil
            ? this.options.waitUntil
            : new Date(),
      })
    }

    return this.options.runAt
  }

  // Set the runAt time on a job directly:
  //   const job = new RedwoodJob()
  //   job.runAt = new Date(2030, 1, 2, 12, 34, 56)
  //   job.performLater()
  set runAt(value) {
    this.options = Object.assign(this.options || {}, { runAt: value })
  }

  // Schedules a job with the appropriate adapter, returns the schedule details.
  // Can't be called directly, the public interface is `performLater()`
  #schedule(args) {
    if (!this.constructor.adapter) {
      throw new AdapterNotConfiguredError()
    }

    return this.constructor.adapter.schedule({
      handler: this.constructor.name,
      args: args,
      runAt: this.runAt,
      queue: this.queue,
      priority: this.priority,
    })
  }
}
