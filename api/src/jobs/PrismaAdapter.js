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

import { BaseAdapter } from './BaseAdapter'

export class PrismaAdapter extends BaseAdapter {
  // Schedules a job by creating a new record in a `BackgroundJob` table
  // (or whatever the accessor is configured to point to).
  schedule({ handler, args, runAt, queue, priority }) {
    return this.options.accessor.create({
      data: {
        handler: JSON.stringify({ handler, args }),
        runAt,
        queue,
        priority,
      },
    })
  }
}
