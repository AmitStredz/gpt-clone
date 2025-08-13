import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/upload/signature',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  const session = await auth()
  if (!session.userId) {
    return Response.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next internals and public assets
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|gif|webp)).*)',
  ],
}

