// Base class for all job adapters. Provides a common interface for scheduling
// jobs. At a minimum, you must implement the `schedule` method in your adapter.
//
// Any object passed to the constructor is saved in `this.options` and should
// be used to configure your custom adapter. If `options.logger` is included
// you can access it via `this.logger`

import { ScheduleNotImplementedError } from './errors'

export class BaseAdapter {
  constructor(options) {
    this.options = options
    this.logger = options?.logger
  }

  schedule() {
    throw new ScheduleNotImplementedError()
  }
}
