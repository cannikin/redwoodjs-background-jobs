import { db } from 'src/lib/db'

import { PrismaAdapter } from '../PrismaAdapter'

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

describe('schedule()', () => {
  test('creates a job in the DB', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const beforeJobCount = await db.backgroundJob.count()
    await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })
    const afterJobCount = await db.backgroundJob.count()

    expect(afterJobCount).toEqual(beforeJobCount + 1)
  })

  test('returns the job record that was created', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const job = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })

    expect(job.handler).toEqual('{"handler":"RedwoodJob","args":["foo","bar"]}')
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

    // definitely a different record in the DB
    expect(job1.id).not.toEqual(job2.id)
    // but all details are identical
    expect(job1.handler).toEqual(job2.handler)
    expect(job1.queue).toEqual(job2.queue)
    expect(job1.priority).toEqual(job2.priority)
  })

  test('defaults some database fields', async () => {
    const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
    const job = await adapter.schedule({
      handler: 'RedwoodJob',
      args: ['foo', 'bar'],
      queue: 'default',
      priority: 50,
      runAt: new Date(),
    })

    expect(job.attempts).toEqual(0)
    expect(job.lockedAt).toBeNull()
    expect(job.lockedBy).toBeNull()
    expect(job.lastError).toBeNull()
    expect(job.failedAt).toBeNull()
  })
})
