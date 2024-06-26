import { jobs } from 'src/lib/jobs'
import { logger } from 'src/lib/logger'

export const handler = async (event, _context) => {
  logger.info(`${event.httpMethod} ${event.path}: jobs function`)

  jobs.productBackorder.performLater(Math.round(Math.random() * 500))

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: `ProductBackorderJob scheduled`,
    }),
  }
}
