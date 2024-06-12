import { BaseAdapter } from '../BaseAdapter'
import * as errors from '../errors'

describe('constructor', () => {
  test('initializing the adapter saves options', () => {
    const adapter = new BaseAdapter({ foo: 'bar' })

    expect(adapter.options.foo).toEqual('bar')
  })

  test('creates a separate instance var for any logger', () => {
    const mockLogger = jest.fn()
    const adapter = new BaseAdapter({ foo: 'bar', logger: mockLogger })

    expect(adapter.logger).toEqual(mockLogger)
  })
})

describe('schedule()', () => {
  test('throws an error if not implemented', () => {
    const adapter = new BaseAdapter({})

    expect(() => adapter.schedule()).toThrow(errors.ScheduleNotImplementedError)
  })
})
