import { jobs } from 'src/lib/jobs'

export const handler = async (_event, _context) => {
  jobs.sample.performLater(Math.round(Math.random() * 500))

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: `SampleJob scheduled`,
    }),
  }
}
