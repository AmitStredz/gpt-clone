import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Clerk handles the redirect; this route just exists as a safe landing page
  // After Clerk creates the session, redirect to home
  const url = new URL("/", request.url)
  return NextResponse.redirect(url)
}


