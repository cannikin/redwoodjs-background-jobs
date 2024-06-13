import { db } from 'src/lib/db'

import * as errors from '../errors'
import { PrismaAdapter, DEFAULT_MODEL_NAME } from '../PrismaAdapter'

jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))

describe('constructor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('defaults this.model name', () => {
    const adapter = new PrismaAdapter({ db })

    expect(adapter.model).toEqual(DEFAULT_MODEL_NAME)
  })

  test('can manually set this.model', () => {
    const dbMock = jest.fn(() => ({
      _runtimeDataModel: {
        models: {
          Job: {
            dbName: null,
          },
        },
      },
      job: {},
    }))
    const adapter = new PrismaAdapter({
      db: dbMock(),
      model: 'Job',
    })

    expect(adapter.model).toEqual('Job')
  })

  test('throws an error with a model name that does not exist', () => {
    expect(() => new PrismaAdapter({ db, model: 'FooBar' })).toThrow(
      errors.ModelNameError
    )
  })

  test('sets this.accessor to the correct Prisma accessor', () => {
    const adapter = new PrismaAdapter({ db })

    expect(adapter.accessor).toEqual(db.backgroundJob)
  })

  test('manually set this.tableName ', () => {
    const adapter = new PrismaAdapter({ db, tableName: 'background_jobz' })

    expect(adapter.tableName).toEqual('background_jobz')
  })

  test('set this.tableName from custom @@map() name in schema', () => {
    const dbMock = jest.fn(() => ({
      _runtimeDataModel: {
        models: {
          BackgroundJob: {
            dbName: 'bg_jobs',
          },
        },
      },
    }))
    const adapter = new PrismaAdapter({
      db: dbMock(),
    })

    expect(adapter.tableName).toEqual('bg_jobs')
  })

  test('default this.tableName to camelCase version of model name', () => {
    const adapter = new PrismaAdapter({ db })

    expect(adapter.tableName).toEqual('BackgroundJob')
  })

  test('sets this.provider based on the active provider', () => {
    const adapter = new PrismaAdapter({ db })

    expect(adapter.provider).toEqual('sqlite')
  })
})

describe('schedule()', () => {
  test('creates a job in the DB', async () => {
    const adapter = new PrismaAdapter({ db })
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
    const adapter = new PrismaAdapter({ db })
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
    const adapter = new PrismaAdapter({ db })
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
    const adapter = new PrismaAdapter({ db })
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
