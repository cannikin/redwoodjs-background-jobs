import { db } from 'src/lib/db'
import { jobs } from 'src/lib/jobs'

export const users = () => {
  return db.user.findMany()
}

export const user = ({ id }) => {
  return db.user.findUnique({
    where: { id },
  })
}

export const createUser = async ({ input }) => {
  const user = await db.user.create({
    data: input,
  })

  await jobs.welcome.performLater(user.id)

  return user
}

export const updateUser = ({ id, input }) => {
  return db.user.update({
    data: input,
    where: { id },
  })
}

export const deleteUser = ({ id }) => {
  return db.user.delete({
    where: { id },
  })
}
