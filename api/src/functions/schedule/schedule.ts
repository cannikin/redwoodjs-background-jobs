import type { APIGatewayEvent, Context } from 'aws-lambda'

import { jobs } from 'src/lib/jobs'
import { logger } from 'src/lib/logger'

console.info(jobs)

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  logger.info(`${event.httpMethod} ${event.path}: jobs function`)

  if (event.queryStringParameters?.run) {
    jobs.productBackorder.performNow(Math.round(Math.random() * 500))
  } else {
    jobs.productBackorder.performLater(Math.round(Math.random() * 500))
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: `ProductBackorderJob ${event.queryStringParameters?.run ? 'running' : 'scheduled'}`,
    }),
  }
}