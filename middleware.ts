import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/upload/signature",
]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes → just continue
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require auth for all other routes
  const session = await auth();
  if (!session.userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ✅ Explicitly return NextResponse.next() here for authenticated requests
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals and public assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)).*)",
  ],
};
