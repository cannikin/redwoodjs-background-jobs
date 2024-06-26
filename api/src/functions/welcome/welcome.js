import { jobs } from 'src/lib/jobs'
import { logger } from 'src/lib/logger'

console.info(jobs)

export const handler = async (event, _context) => {
  logger.info(`${event.httpMethod} ${event.path}: jobs function`)

  jobs.welcomeEmail.performLater('john.doe@example.com')

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: `WelcomeEmailJob scheduled`,
    }),
  }
}
