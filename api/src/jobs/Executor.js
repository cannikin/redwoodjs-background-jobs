import { AdapterRequiredError, JobRequiredError } from 'src/jobs/errors'

export class Executor {
  constructor(options) {
    this.options = options
    this.adapter = options?.adapter
    this.job = options?.job

    if (!this.adapter) throw new AdapterRequiredError()
    if (!this.job) throw new JobRequiredError()
  }

  #log(message) {
    const { handler, args } = JSON.parse(this.job.handler)

    console.info(`[${handler}] ${message} ${this.job.id}`, {
      args: args,
    })
  }

  // Actually instantiate the job class and call `perform()` on it, passing in
  // any args
  async perform(job) {
    this.#log('Started', job)

    try {
      const details = JSON.parse(this.job.handler)
      const Job = await import(`./${details.handler}.js`)
      await new Job[details.handler]().perform(...details.args)

      this.#success()
    } catch (e) {
      console.info(e)
      this.#failure(e)
    }
  }

  // Handle job success: remove from DB
  #success() {
    this.#log('Complete')
    this.adapter.success(this.job)
  }

  // Handle job failure: add error to DB and retry time (or mark `failedAt`)
  #failure(error) {
    this.#log('Failed')
    this.adapter.failure(this.job, error)
  }
}
