import { RedwoodJob } from './RedwoodJob'

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

describe('constructor', () => {
  test('returns an instance of the job', () => {
    const job = new RedwoodJob()
    expect(job).toBeInstanceOf(RedwoodJob)
  })

  test('can set options for the job', () => {
    const job = new RedwoodJob({ foo: 'bar' })
    expect(job.options.foo).toEqual('bar')
  })
})

describe('set()', () => {
  test('returns a job instance', () => {
    const job = RedwoodJob.set({ wait: 300 })

    expect(job).toBeInstanceOf(RedwoodJob)
  })

  test('sets options for the job', () => {
    const job = RedwoodJob.set({ foo: 'bar' })

    expect(job.options.foo).toEqual('bar')
  })

  test('sets the default queue', () => {
    const job = RedwoodJob.set({ foo: 'bar' })

    expect(job.options.queue).toEqual(RedwoodJob.queue)
  })

  test('sets the default priority', () => {
    const job = RedwoodJob.set({ foo: 'bar' })

    expect(job.options.priority).toEqual(RedwoodJob.priority)
  })

  test('can override the queue name set in the class', () => {
    const job = RedwoodJob.set({ foo: 'bar', queue: 'priority' })

    expect(job.options.queue).toEqual('priority')
  })

  test('can override the priority set in the class', () => {
    const job = RedwoodJob.set({ foo: 'bar', priority: 10 })

    expect(job.options.priority).toEqual(10)
  })
})

describe('get runAt()', () => {
  test('returns the current time if no options are set', () => {
    const job = new RedwoodJob()

    expect(job.runAt).toEqual(new Date())
  })

  test('returns a datetime `wait` seconds in the future', async () => {
    const job = RedwoodJob.set({ wait: 300 })

    expect(job.runAt).toEqual(new Date(new Date() + 300 * 1000))
  })

  test('returns a datetime set to `waitUntil`', async () => {
    const futureDate = new Date(2030, 1, 2, 12, 34, 56)
    const job = RedwoodJob.set({
      waitUntil: futureDate,
    })

    expect(job.runAt).toEqual(futureDate)
  })

  test('returns any datetime set directly on the instance', () => {
    const futureDate = new Date(2030, 1, 2, 12, 34, 56)
    const job = new RedwoodJob()
    job.runAt = futureDate

    expect(job.runAt).toEqual(futureDate)
  })
})

describe('get queue()', () => {
  test('defaults to queue set in class', () => {
    const job = new RedwoodJob()

    expect(job.queue).toEqual(RedwoodJob.queue)
  })

  test('can manually set the queue name on an instance', () => {
    const job = new RedwoodJob()
    job.queue = 'priority'

    expect(job.queue).toEqual('priority')
  })

  test('queue set manually overrides queue set as an option', () => {
    const job = RedwoodJob.set({ queue: 'priority' })
    job.queue = 'important'

    expect(job.queue).toEqual('important')
  })
})

describe('get priority()', () => {
  test('defaults to priority set in class', () => {
    const job = new RedwoodJob()

    expect(job.priority).toEqual(RedwoodJob.priority)
  })

  test('can manually set the priority name on an instance', () => {
    const job = new RedwoodJob()
    job.priority = 10

    expect(job.priority).toEqual(10)
  })

  test('priority set manually overrides priority set as an option', () => {
    const job = RedwoodJob.set({ priority: 20 })
    job.priority = 10

    expect(job.priority).toEqual(10)
  })
})

describe('performLater()', () => {
  test('returns the properties of the scheduled job', async () => {
    const job = await RedwoodJob.performLater('foo', 'bar')

    expect(job.handler).toEqual({ class: 'RedwoodJob', args: ['foo', 'bar'] })
    expect(job.runAt).toEqual(new Date())
    expect(job.queue).toEqual(RedwoodJob.queue)
  })
})

describe('instance performNow()', () => {
  test('invokes the perform() function immediately', async () => {
    class TestJob extends RedwoodJob {
      async perform() {
        return 'done'
      }
    }

    const spy = jest.spyOn(TestJob.prototype, 'perform')

    new TestJob().performNow('foo', 'bar')

    expect(spy).toHaveBeenCalledWith('foo', 'bar')
  })
})

describe('static performNow()', () => {
  test('invokes the perform() function immediately', async () => {
    class TestJob extends RedwoodJob {
      async perform() {
        return 'done'
      }
    }

    const spy = jest.spyOn(TestJob.prototype, 'perform')

    TestJob.performNow('foo', 'bar')

    expect(spy).toHaveBeenCalledWith('foo', 'bar')
  })
})
