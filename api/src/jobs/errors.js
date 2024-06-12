// Parent class for any RedwoodJob-related error
export class RedwoodJobError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

// Thrown when trying to schedule a job without an adapter configured
export class AdapterNotConfiguredError extends RedwoodJobError {
  constructor() {
    super('No adapter configured for RedwoodJob')
    this.name = this.constructor.name
  }
}

// Thrown when trying to schedule a job without a `perform` method
export class PerformNotImplementedError extends RedwoodJobError {
  constructor() {
    super('You must implement the `perform` method in your job class')
    this.name = this.constructor.name
  }
}

// Thrown when a custom adapter does not implement the `schedule` method
export class ScheduleNotImplementedError extends RedwoodJobError {
  constructor() {
    super('You must implement the `schedule` method in your adapter')
    this.name = this.constructor.name
  }
}

export class SchedulingError extends RedwoodJobError {
  constructor(message, error) {
    super(message)

    if (!error) {
      throw new Error('SchedulingError requires a message and error')
    }

    this.name = this.constructor.name
    this.original_error = error
    this.stack_before_rethrow = this.stack

    const messageLines = (this.message.match(/\n/g) || []).length + 1
    this.stack =
      this.stack
        .split('\n')
        .slice(0, messageLines + 1)
        .join('\n') +
      '\n' +
      error.stack
  }
}
