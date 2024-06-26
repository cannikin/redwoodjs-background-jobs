export const isAuthenticated = () => {
  return true
}

export const hasRole = ({ roles }) => {
  return roles !== undefined
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const requireAuth = ({ roles }) => {
  return isAuthenticated()
}

export const getCurrentUser = async () => {
  throw new Error(
    'Auth is not set up yet. See https://redwoodjs.com/docs/authentication ' +
      'to get started'
  )
}
