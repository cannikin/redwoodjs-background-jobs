// Parent class for any RedwoodJob-related error
export class RedwoodJobError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RedwoodJobError'
  }
}

// Thrown when trying to schedule a job without an adapter configured
export class AdapterNotConfiguredError extends RedwoodJobError {
  constructor() {
    super('No adapter configured for RedwoodJob')
    this.name = 'AdapterNotConfiguredError'
  }
}

// Thrown when trying to schedule a job without a `perform` method
export class PerformNotImplementedError extends RedwoodJobError {
  constructor() {
    super('You must implement the `perform` method in your job class')
    this.name = 'PerformNotImplementedError'
  }
}

// Thrown when a custom adapter does not implement the `schedule` method
export class ScheduleNotImplementedError extends RedwoodJobError {
  constructor() {
    super('You must implement the `schedule` method in your adapter')
    this.name = 'ScheduleNotImplementedError'
  }
}
