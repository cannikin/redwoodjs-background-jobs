// Base class for all job adapters. Provides a common interface for scheduling
// jobs. At a minimum, you must implement the `schedule` method in your adapter.
//
// Any object passed to the constructor is saved in `this.options` and should
// be used to configure your custom adapter.

export class Adapter {
  constructor(options) {
    this.options = options
  }

  schedule() {
    throw new Error('You must implement the `schedule` method in your adapter')
  }
}
