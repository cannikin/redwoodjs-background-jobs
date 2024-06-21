// import { test, expect } from '@jest/globals'

export const standard = defineScenario({
  backgroundJob: {
    email: {
      data: {
        id: 1,
        handler: JSON.stringify({ handler: 'EmailJob', args: [123] }),
        queue: 'email',
        priority: 50,
        runAt: '2021-04-30T15:35:19Z',
      },
    },
  },
})

// test('truth', () => {
//   expect(true)
// })
