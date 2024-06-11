// Base class for all job adapters. Provides a common interface for scheduling
// jobs. At a minimum, you must implement the `schedule` method in your adapter.
//
// Any object passed to the constructor is saved in `this.options` and should
// be used to configure your custom adapter.

import { ScheduleNotImplementedError } from './errors'

export class Adapter {
  constructor(options) {
    this.options = options
  }

  schedule() {
    throw new ScheduleNotImplementedError()
  }
}
