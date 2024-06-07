import { RedwoodJob } from './RedwoodJob'

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

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

  test('can set a custom queue', () => {
    const job = RedwoodJob.set({ foo: 'bar', queue: 'priority' })

    expect(job.options.queue).toEqual('priority')
  })
})

describe('performLater()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('schedules the job', async () => {
    const spy = jest.spyOn(RedwoodJob.prototype, 'schedule')

    await RedwoodJob.performLater('SampleJob', 'foo', 'bar')

    expect(spy).toHaveBeenCalledWith(['SampleJob', 'foo', 'bar'])
  })

  test('returns the properties of the created job', async () => {
    const job = await RedwoodJob.performLater('SampleJob', 'foo', 'bar')

    expect(job.handler).toEqual('SampleJob')
    expect(job.arguments).toEqual(['foo', 'bar'])
    expect(job.runAt).toEqual(new Date())
    expect(job.queue).toEqual(RedwoodJob.queue)
  })
})

describe('chain set() and performLater()', () => {
  test('sets options for the job and schedules it', async () => {
    const job = RedwoodJob.set({}).performLater('SampleJob', 'foo', 'bar')

    expect(job.handler).toEqual('SampleJob')
    expect(job.arguments).toEqual(['foo', 'bar'])
    expect(job.runAt).toEqual(new Date())
    expect(job.queue).toEqual(RedwoodJob.queue)
  })

  test('sets a job to run after a certain amount of time', async () => {
    const job = RedwoodJob.set({ wait: 300 }).performLater('SampleJob')

    expect(job.runAt).toEqual(new Date(new Date() + 300 * 1000))
  })

  test('sets a job to run at a specific time', async () => {
    const futureDate = new Date(2030, 1, 2, 12, 34, 56)
    const job = RedwoodJob.set({
      waitUntil: futureDate,
    }).performLater('SampleJob')

    expect(job.runAt).toEqual(futureDate)
  })
})
