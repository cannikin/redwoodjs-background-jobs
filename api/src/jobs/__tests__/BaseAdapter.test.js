import { BaseAdapter } from '../BaseAdapter'
import * as errors from '../errors'

describe('constructor', () => {
  test('initializing the adapter saves options', () => {
    const adapter = new BaseAdapter({ foo: 'bar' })

    expect(adapter.options.foo).toEqual('bar')
  })
})

describe('schedule()', () => {
  test('throws an error if not implemented', () => {
    const adapter = new BaseAdapter({})

    expect(() => adapter.schedule()).toThrow(errors.ScheduleNotImplementedError)
  })
})
