import { WelcomeEmailJob } from 'src/jobs/WelcomeEmailJob'

export const handler = async (_event, _context) => {
  await WelcomeEmailJob.set({ wait: 300 }).performLater('john.doe@example.com')

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
