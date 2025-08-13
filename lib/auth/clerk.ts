import { auth, currentUser } from '@clerk/nextjs/server'

export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

export async function getCurrentUserSafe() {
  try {
    return await currentUser()
  } catch {
    return null
  }
}

