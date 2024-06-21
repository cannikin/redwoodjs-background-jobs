// Implements a job adapter using Prisma ORM. Assumes a table exists with the
// following schema (the table name and primary key name can be customized):
//
//   model BackgroundJob {
//     id        Int       @id @default(autoincrement())
//     attempts  Int       @default(0)
//     handler   String
//     queue     String
//     priority  Int
//     runAt     DateTime
//     lockedAt  DateTime?
//     lockedBy  String?
//     lastError String?
//     failedAt  DateTime?
//     createdAt DateTime  @default(now())
//     updatedAt DateTime  @updatedAt
//   }
//
// Initialize this adapter passing an `accessor` which is the property on an
// instance of PrismaClient that points to the table thats stores the jobs. In
// the above schema, PrismaClient will create a `backgroundJob` property on
// Redwood's `db` instance:
//
//   import { db } from 'src/lib/db'
//   const adapter = new PrismaAdapter({ accessor: db.backgroundJob })
//   RedwoodJob.config({ adapter })

import { camelCase } from 'change-case'

import { BaseAdapter } from './BaseAdapter'
import { ModelNameError } from './errors'

export const DEFAULT_MODEL_NAME = 'BackgroundJob'

export class PrismaAdapter extends BaseAdapter {
  constructor(options) {
    super(options)

    // instance of PrismaClient
    this.db = options.db

    // name of the model as defined in schema.prisma
    this.model = options.model || DEFAULT_MODEL_NAME

    // the function to call on `db` to make queries: `db.backgroundJob`
    this.accessor = this.db[camelCase(this.model)]

    // the raw table name in the database
    // if @@map() is used in the schema then the name will be present in
    //   db._runtimeDataModel
    // otherwise it is the same as the model name
    try {
      this.tableName =
        options.tableName ||
        this.db._runtimeDataModel.models[this.model].dbName ||
        this.model
    } catch (e) {
      // model name must not be right because `this.model` wasn't found in
      // `this.db._runtimeDataModel.models`
      if (e.name === 'TypeError' && e.message.match("reading 'dbName'")) {
        throw new ModelNameError(this.model)
      } else {
        throw e
      }
    }

    // the database provider type: 'sqlite' | 'postgresql' | 'mysql'
    this.provider = options.db._activeProvider
  }

  // Finds the next job to run, locking it so that no other process can pick it
  // The act of locking a job is dependant on the DB server, so we'll run some
  // raw SQL to do it in each case—Prisma doesn't provide enough flexibility
  // in their DSL.
  find(options) {
    switch (this.options.db._activeProvider) {
      case 'sqlite':
        return this.#sqliteFind(options)
    }
  }

  success(job) {
    console.info('Marking job as succeeded', job.id)
  }

  failure(job, error) {
    console.info('Marking job as failed', job.id, error)
  }

  // Schedules a job by creating a new record in a `BackgroundJob` table
  // (or whatever the accessor is configured to point to).
  schedule({ handler, args, runAt, queue, priority }) {
    return this.accessor.create({
      data: {
        handler: JSON.stringify({ handler, args }),
        runAt,
        queue,
        priority,
      },
    })
  }

  async #sqliteFind({ processName, maxRuntime }) {
    const where = `
      (
        (
          runAt <= ${new Date().getTime()} AND (
            lockedAt IS NULL OR
            lockedAt < ${new Date(new Date() - maxRuntime).getTime()}
          ) OR lockedBy = '${processName}'
        ) AND failedAt IS NULL
      )
    `

    // Find any jobs that should run now. Look for ones that:
    // - have a runtAt in the past
    // - and are either not locked, or were locked more than `maxRuntime` ago
    // - or were already locked by this exact process and never cleaned up
    // - and don't have a failedAt, meaning we will stop retrying
    let outstandingJobs = await this.db.$queryRawUnsafe(`
        SELECT id, attempts
        FROM   ${this.tableName}
        WHERE  ${where}
        ORDER BY priority ASC, runAt ASC
        LIMIT 1;`)

    if (outstandingJobs.length) {
      const id = outstandingJobs[0].id

      // If one was found, try to lock it by updating the record with the
      // same WHERE clause as above (if another locked in the meantime it won't
      // find any record to update)
      const updatedCount = await this.db.$queryRawUnsafe(`
          UPDATE  ${this.tableName}
          SET     lockedAt = ${new Date().getTime()},
                  lockedBy = '${processName}',
                  attempts = ${outstandingJobs[0].attempts + 1}
          WHERE   ${where} AND id = ${id};`)

      // Assuming the update worked, return the job
      if (updatedCount) {
        const job = await this.db.$queryRawUnsafe(`
            SELECT *
            FROM   ${this.tableName}
            WHERE  id = ${id};`)
        return job[0]
      }
    }

    // If we get here then there were either no jobs, or the one we found
    // was locked by another worker
    return null
  }
}
