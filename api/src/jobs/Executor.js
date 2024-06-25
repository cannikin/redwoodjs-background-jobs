// Used by the job runner to execute a job and track success or failure

import { AdapterRequiredError, JobRequiredError } from 'src/jobs/errors'

export class Executor {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.job = options?.job
    this.logger = options?.logger

    if (!this.adapter) throw new AdapterRequiredError()
    if (!this.job) throw new JobRequiredError()
  }

  #log(message, stack) {
    const { handler, args } = JSON.parse(this.job.handler)
    const parts = [
      `[${handler}] ${message} ${this.job.id}`,
      {
        args: args,
      },
    ]
    if (stack) {
      parts.push(stack)
    }
    this.logger.info(...parts)
  }

  async perform(job) {
    this.#log('Started', job)

    try {
      const details = JSON.parse(this.job.handler)
      const Job = await import(`./${details.handler}.js`)
      await new Job[details.handler]().perform(...details.args)

      this.#success()
    } catch (e) {
      this.#log(e.message, e.stack)
      this.#failure(e)
    }
  }

  // Handle job success: remove from DB
  #success() {
    this.#log('Success')
    this.adapter.success(this.job)
  }

  // Handle job failure: add error to DB and retry time (or mark `failedAt`)
  #failure(error) {
    this.#log('Failed')
    this.adapter.failure(this.job, error)
  }
}
