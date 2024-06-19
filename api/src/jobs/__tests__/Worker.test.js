import * as errors from '../errors'
import { Executor } from '../Executor'
import { DEFAULT_QUEUE } from '../RedwoodJob'
import { Worker, DEFAULT_MAX_RUNTIME, DEFAULT_WAIT_TIME } from '../Worker'

jest.mock('../Executor')

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

describe('constructor', () => {
  test('saves options', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.options).toEqual(options)
  })

  test('extracts adaptert from options to variable', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.adapter).toEqual('adapter')
  })

  test('extracts queue from options to variable', () => {
    const options = { adapter: 'adapter', queue: 'queue' }
    const worker = new Worker(options)

    expect(worker.queue).toEqual('queue')
  })

  test('sets default queue if not provided', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.queue).toEqual(DEFAULT_QUEUE)
  })

  test('extracts processName from options to variable', () => {
    const options = { adapter: 'adapter', processName: 'processName' }
    const worker = new Worker(options)

    expect(worker.processName).toEqual('processName')
  })

  test('defaults processName if not provided', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.processName).toMatch(/runner-\d+/)
  })

  test('extracts maxRuntime from options to variable', () => {
    const options = { adapter: 'adapter', maxRuntime: 1000 }
    const worker = new Worker(options)

    expect(worker.maxRuntime).toEqual(1000)
  })

  test('sets default maxRuntime if not provided', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.maxRuntime).toEqual(DEFAULT_MAX_RUNTIME)
  })

  test('extracts waitTime from options to variable', () => {
    const options = { adapter: 'adapter', waitTime: 1000 }
    const worker = new Worker(options)

    expect(worker.waitTime).toEqual(1000)
  })

  test('sets default waitTime if not provided', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.waitTime).toEqual(DEFAULT_WAIT_TIME)
  })

  test('can set waitTime to 0', () => {
    const options = { adapter: 'adapter', waitTime: 0 }
    const worker = new Worker(options)

    expect(worker.waitTime).toEqual(0)
  })

  test('sets lastCheckTime to the current time', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.lastCheckTime).toBeInstanceOf(Date)
  })

  test('extracts forever from options to variable', () => {
    const options = { adapter: 'adapter', forever: false }
    const worker = new Worker(options)

    expect(worker.forever).toEqual(false)
  })

  test('sets forever to `true` by default', () => {
    const options = { adapter: 'adapter' }
    const worker = new Worker(options)

    expect(worker.forever).toEqual(true)
  })

  test('throws an error if adapter not set', () => {
    expect(() => new Worker()).toThrow(errors.AdapterRequiredError)
  })
})

describe('run', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('tries to find a job', async () => {
    const adapter = { find: jest.fn(() => null) }
    const worker = new Worker({ adapter, waitTime: 0, forever: false })

    await worker.run()

    expect(adapter.find).toHaveBeenCalledWith({
      processName: worker.processName,
      maxRuntime: worker.maxRuntime,
    })
  })

  test('does nothing if no job found', async () => {
    const adapter = { find: jest.fn(() => null) }
    const mockExecutor = jest.fn()
    jest.mock('../Executor', () => ({ Executor: mockExecutor }))

    const worker = new Worker({ adapter, waitTime: 0, forever: false })
    await worker.run()

    expect(mockExecutor).not.toHaveBeenCalled()
  })

  test('initializes an Executor instance if the job is found', async () => {
    const adapter = { find: jest.fn(() => ({ id: 1 })) }
    const worker = new Worker({ adapter, waitTime: 0, forever: false })

    await worker.run()

    expect(Executor).toHaveBeenCalledWith({ adapter, job: { id: 1 } })
  })

  test('calls `perform` on the Executor instance', async () => {
    const adapter = { find: jest.fn(() => ({ id: 1 })) }
    const spy = jest.spyOn(Executor.prototype, 'perform')
    const worker = new Worker({ adapter, waitTime: 0, forever: false })

    await worker.run()

    expect(spy).toHaveBeenCalled()
  })

  test('calls `perform` on the Executor instance', async () => {
    const adapter = { find: jest.fn(() => ({ id: 1 })) }
    const spy = jest.spyOn(Executor.prototype, 'perform')
    const worker = new Worker({ adapter, waitTime: 0, forever: false })

    await worker.run()

    expect(spy).toHaveBeenCalled()
  })
})
