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

  test('can override the queue name set in the class itself', () => {
    const job = RedwoodJob.set({ foo: 'bar', queue: 'priority' })

    expect(job.options.queue).toEqual('priority')
  })
})

describe('runAt', () => {
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

describe('performLater()', () => {
  test('returns the properties of the scheduled job', async () => {
    const job = await RedwoodJob.performLater('foo', 'bar')

    expect(job.handler).toEqual('RedwoodJob')
    expect(job.arguments).toEqual(['foo', 'bar'])
    expect(job.runAt).toEqual(new Date())
    expect(job.queue).toEqual(RedwoodJob.queue)
  })
})
