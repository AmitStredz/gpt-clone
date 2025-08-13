import 'server-only'

export const runtime = 'nodejs'

export async function POST() {
  // Placeholder for Clerk webhook validation and user sync.
  return new Response(null, { status: 204 })
}

