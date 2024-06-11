import { Adapter } from '../Adapter'

describe('constructor', () => {
  test('initializing the adapter saves options', () => {
    const adapter = new Adapter({ foo: 'bar' })

    expect(adapter.options.foo).toEqual('bar')
  })
})

describe('schedule()', () => {
  test('throws an error if not implemented', () => {
    const adapter = new Adapter({})

    expect(() => adapter.schedule()).toThrow(
      'You must implement the `schedule` method in your adapter'
    )
  })
})
