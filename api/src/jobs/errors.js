export class RedwoodJobPerformNotImplementedError extends Error {
  constructor() {
    super('You must implement the `perform` method in your job class')
    this.name = 'RedwoodJobPerformNotImplementedError'
  }
}

export class RedwoodJobNoAdapterError extends Error {
  constructor() {
    super('No adapter configured for RedwoodJob')
    this.name = 'RedwoodJobNoAdapterError'
  }
}
