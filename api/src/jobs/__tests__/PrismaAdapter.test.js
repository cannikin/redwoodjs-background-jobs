import { db } from 'src/lib/db'

import { PrismaAdapter } from '../PrismaAdapter'

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

describe('schedule()', () => {
  test('creates a job in the DB', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const beforeJobCount = await db.backgroundJob.count()
    const job = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })
    const afterJobCount = await db.backgroundJob.count()

    expect(afterJobCount).toEqual(beforeJobCount + 1)
    expect(job.handler).toEqual(
      JSON.stringify({ handler: 'RedwoodJob', args: ['foo', 'bar'] })
    )
    expect(job.runAt).toEqual(new Date())
    expect(job.queue).toEqual('default')
    expect(job.priority).toEqual(50)
  })

  test('makes no attempt to de-dupe jobs', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const job1 = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })
    const job2 = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })

    expect(job1.id).not.toEqual(job2.id)
    expect(job1.handler).toEqual(job2.handler)
    expect(job1.queue).toEqual(job2.queue)
    expect(job1.priority).toEqual(job2.priority)
  })

  test('defaults to 0 attempts', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const job = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })

    expect(job.attempts).toEqual(0)
  })
})
