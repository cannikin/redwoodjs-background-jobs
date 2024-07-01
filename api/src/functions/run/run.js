import { jobs } from 'src/lib/jobs'

export const handler = async (event, _context) => {
  await jobs.productBackorder.performNow(Math.round(Math.random() * 500))

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: `ProductBackorderJob ran`,
    }),
  }
}
